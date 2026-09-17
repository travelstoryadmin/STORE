-- Travel Story atomic billing function.
-- Run this after supabase/store.sql in the Production Supabase SQL Editor.
create or replace function public.create_bill_transaction(payload jsonb)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  v_bill_id bigint;
  v_customer_id bigint;
  v_customer jsonb := payload->'customer';
  v_item jsonb;
  v_stock integer;
  v_old_balance numeric(12,2) := 0;
  v_balance numeric(12,2) := greatest(0,coalesce((payload->>'total')::numeric,0)-coalesce((payload->>'paid')::numeric,0));
  v_payment text := payload->>'payment';
begin
  if payload->>'bill_no' is null or trim(payload->>'bill_no')='' then raise exception 'Bill number is required'; end if;
  if v_payment not in ('Cash','GPay / UPI','Credit') then raise exception 'Invalid payment method'; end if;
  if coalesce(jsonb_array_length(payload->'items'),0)=0 then raise exception 'At least one bill item is required'; end if;

  v_customer_id := (v_customer->>'id')::bigint;
  insert into customers(id,name,mobile,place,balance)
  values(v_customer_id,coalesce(v_customer->>'name',''),coalesce(v_customer->>'mobile',''),coalesce(v_customer->>'place',''),coalesce((v_customer->>'balance')::numeric,0))
  on conflict(id) do update set name=excluded.name,mobile=excluded.mobile,place=excluded.place;

  select balance into v_old_balance from customers where id=v_customer_id for update;

  insert into bills(id,bill_no,bill_date,customer_id,subtotal,discount,total,paid,balance,payment,expense,profit,status)
  values((payload->>'id')::bigint,payload->>'bill_no',(payload->>'bill_date')::date,v_customer_id,
    coalesce((payload->>'subtotal')::numeric,0),coalesce((payload->>'discount')::numeric,0),coalesce((payload->>'total')::numeric,0),
    coalesce((payload->>'paid')::numeric,0),v_balance,v_payment,coalesce((payload->>'expense')::numeric,0),coalesce((payload->>'profit')::numeric,0),'Completed')
  returning id into v_bill_id;

  for v_item in select * from jsonb_array_elements(payload->'items') loop
    select stock into v_stock from products where id=(v_item->>'product_id')::bigint for update;
    if not found then raise exception 'Product not found: %',v_item->>'product_id'; end if;
    if v_stock < (v_item->>'qty')::integer then raise exception 'Insufficient stock for product: %',v_item->>'name'; end if;
    insert into bill_items(bill_id,product_id,name_snapshot,qty,price,expense,total)
    values(v_bill_id,(v_item->>'product_id')::bigint,v_item->>'name',(v_item->>'qty')::integer,coalesce((v_item->>'price')::numeric,0),coalesce((v_item->>'expense')::numeric,0),coalesce((v_item->>'total')::numeric,0));
    update products set stock=stock-(v_item->>'qty')::integer,updated_at=now() where id=(v_item->>'product_id')::bigint;
  end loop;

  update customers set balance=case when v_payment='Credit' then v_old_balance+v_balance else greatest(0,v_old_balance-v_balance) end,updated_at=now() where id=v_customer_id;
  return v_bill_id;
exception when unique_violation then
  raise exception 'A bill with this bill number already exists';
end;
$$;

grant execute on function public.create_bill_transaction(jsonb) to service_role;

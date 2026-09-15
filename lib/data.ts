export type Role='admin'|'staff';
export type Product={id:number;name:string;category:string;price:number;expense:number;stock:number;image:string;active:boolean};
export type Customer={id:number;name:string;mobile:string;place:string;balance:number};
export type BillItem={productId:number;name:string;qty:number;price:number;expense:number;total:number};
export type Bill={id:number;billNo:string;date:string;customer:Customer;items:BillItem[];subtotal:number;paid:number;balance:number;payment:'Cash'|'GPay / UPI'|'Credit';expense:number;profit:number;status:'Completed'};
export type StockLog={id:number;productId:number;productName:string;qty:number;expense:number;date:string;type:'Purchase'|'Adjustment'};
export const categories=['Attar & Perfumes','Gift Items','Home Decor','Islamic Products','Craft Works','Personal Care','Combo Packs'];
export const seedProducts:Product[]=[
{id:1,name:'Oud Al Haramain',category:'Attar & Perfumes',price:1200,expense:650,stock:15,image:'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=700&q=80',active:true},
{id:2,name:'Rose Attar',category:'Attar & Perfumes',price:850,expense:420,stock:22,image:'https://images.unsplash.com/photo-1615634260167-c8cdede054de?auto=format&fit=crop&w=700&q=80',active:true},
{id:3,name:'Musk Al Tahara',category:'Attar & Perfumes',price:950,expense:500,stock:18,image:'https://images.unsplash.com/photo-1547887538-e3a2f32cb1cc?auto=format&fit=crop&w=700&q=80',active:true},
{id:4,name:'Sandalwood Attar',category:'Attar & Perfumes',price:780,expense:410,stock:8,image:'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=700&q=80',active:true},
{id:5,name:'Amber Bliss',category:'Attar & Perfumes',price:1050,expense:560,stock:12,image:'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=700&q=80',active:true},
{id:6,name:'Handmade Resin Frame',category:'Gift Items',price:650,expense:300,stock:30,image:'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=700&q=80',active:true},
{id:7,name:'Decorative Lantern',category:'Home Decor',price:900,expense:470,stock:14,image:'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=700&q=80',active:true},
{id:8,name:'Islamic Wall Art',category:'Islamic Products',price:1800,expense:900,stock:15,image:'https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&w=700&q=80',active:true},
{id:9,name:'Customized Gift Box',category:'Gift Items',price:650,expense:300,stock:30,image:'https://images.unsplash.com/photo-1512909006721-3d6018887383?auto=format&fit=crop&w=700&q=80',active:true},
{id:10,name:'Wooden Craft Piece',category:'Craft Works',price:1200,expense:700,stock:10,image:'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=700&q=80',active:true},
{id:11,name:'Tasbih (Prayer Beads)',category:'Islamic Products',price:400,expense:180,stock:30,image:'https://images.unsplash.com/photo-1609602644875-1c4d9c1e6f5d?auto=format&fit=crop&w=700&q=80',active:true},
{id:12,name:'Luxury Gift Set',category:'Combo Packs',price:2500,expense:1400,stock:6,image:'https://images.unsplash.com/photo-1549465220-1a8f9238cd48?auto=format&fit=crop&w=700&q=80',active:true}];
export const seedCustomers:Customer[]=[{id:1,name:'Irfan',mobile:'8589868773',place:'Munnar',balance:450},{id:2,name:'Sajad Yoosu',mobile:'5646546546',place:'Tirur',balance:100},{id:3,name:'Ayesha',mobile:'9876543210',place:'Kozhikode',balance:0}];
export const money=(n:number)=>`₹ ${Number(n||0).toLocaleString('en-IN')}`;
export const today=()=>new Date().toLocaleString('en-IN',{dateStyle:'short',timeStyle:'short'});
export const WA_NUMBER='919999999999';

export type Role='admin'|'staff';
export type Product={id:number;name:string;category:string;price:number;expense:number;stock:number;image:string;active:boolean};
export type Customer={id:number;name:string;mobile:string;place:string;balance:number};
export type BillItem={productId:number;name:string;qty:number;price:number;expense:number;total:number};
export type Bill={id:number;billNo:string;date:string;customer:Customer;items:BillItem[];subtotal:number;paid:number;balance:number;payment:'Cash'|'GPay / UPI'|'Credit';expense:number;profit:number;status:'Completed'};
export type StockLog={id:number;productId:number;productName:string;qty:number;expense:number;date:string;type:'Purchase'|'Adjustment'};
export const categories=['Attar & Perfumes','Gift Items','Home Decor','Islamic Products','Craft Works','Personal Care','Combo Packs'];
export const seedProducts:Product[]=[
{id:1,name:'Oud Al Haramain',category:'Attar & Perfumes',price:1200,expense:650,stock:15,image:'/products/p1.png',active:true},
{id:2,name:'Rose Attar',category:'Attar & Perfumes',price:850,expense:420,stock:22,image:'/products/p2.png',active:true},
{id:3,name:'Musk Al Tahara',category:'Attar & Perfumes',price:950,expense:500,stock:18,image:'/products/p3.png',active:true},
{id:4,name:'Sandalwood Attar',category:'Attar & Perfumes',price:780,expense:410,stock:8,image:'/products/p4.png',active:true},
{id:5,name:'Amber Bliss',category:'Attar & Perfumes',price:1050,expense:560,stock:12,image:'/products/p5.png',active:true},
{id:6,name:'Handmade Resin Frame',category:'Gift Items',price:650,expense:300,stock:30,image:'/products/p6.png',active:true},
{id:7,name:'Decorative Lantern',category:'Home Decor',price:900,expense:470,stock:14,image:'/products/p7.png',active:true},
{id:8,name:'Islamic Wall Art',category:'Islamic Products',price:1800,expense:900,stock:15,image:'/products/p8.png',active:true},
{id:9,name:'Customized Gift Box',category:'Gift Items',price:650,expense:300,stock:30,image:'/products/p9.png',active:true},
{id:10,name:'Wooden Craft Piece',category:'Craft Works',price:1200,expense:700,stock:10,image:'/products/p10.png',active:true},
{id:11,name:'Tasbih (Prayer Beads)',category:'Islamic Products',price:400,expense:180,stock:30,image:'/products/p11.png',active:true},
{id:12,name:'Luxury Gift Set',category:'Combo Packs',price:2500,expense:1400,stock:6,image:'/products/p12.png',active:true},
{id:13,name:'Premium Oud Royale',category:'Attar & Perfumes',price:1650,expense:900,stock:20,image:'/products/p13.png',active:true},
{id:14,name:'Arabic Bakhoor',category:'Attar & Perfumes',price:750,expense:360,stock:25,image:'/products/p14.png',active:true},
{id:15,name:'Royal Musk Spray',category:'Personal Care',price:1100,expense:580,stock:16,image:'/products/p15.png',active:true},
{id:16,name:'Premium Tasbih',category:'Islamic Products',price:550,expense:240,stock:35,image:'/products/p16.png',active:true},
{id:17,name:'Quran Stand',category:'Islamic Products',price:950,expense:480,stock:12,image:'/products/p17.png',active:true},
{id:18,name:'Ramadan Gift Box',category:'Combo Packs',price:1450,expense:780,stock:18,image:'/products/p18.png',active:true},
{id:19,name:'Decorative Candle Set',category:'Home Decor',price:700,expense:320,stock:20,image:'/products/p19.png',active:true},
{id:20,name:'Handmade Wooden Tray',category:'Craft Works',price:1350,expense:720,stock:9,image:'/products/p20.png',active:true},
{id:21,name:'Travel Gift Combo',category:'Combo Packs',price:1850,expense:980,stock:10,image:'/products/p21.png',active:true},
{id:22,name:'Personal Care Gift Set',category:'Personal Care',price:1250,expense:650,stock:14,image:'/products/p22.png',active:true}
];
export const seedCustomers:Customer[]=[{id:1,name:'Irfan',mobile:'8589868773',place:'Munnar',balance:450},{id:2,name:'Sajad Yoosu',mobile:'5646546546',place:'Tirur',balance:100},{id:3,name:'Ayesha',mobile:'9876543210',place:'Kozhikode',balance:0}];
export const money=(n:number)=>`₹ ${Number(n||0).toLocaleString('en-IN')}`;
export const today=()=>new Date().toLocaleString('en-IN',{dateStyle:'short',timeStyle:'short'});
export const WA_NUMBER='919999999999';

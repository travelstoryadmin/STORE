module.exports = [
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/action-async-storage.external.js [external] (next/dist/server/app-render/action-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/action-async-storage.external.js", () => require("next/dist/server/app-render/action-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/dynamic-access-async-storage.external.js [external] (next/dist/server/app-render/dynamic-access-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/dynamic-access-async-storage.external.js", () => require("next/dist/server/app-render/dynamic-access-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/runtime-reacts.external.js [external] (next/dist/server/runtime-reacts.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/runtime-reacts.external.js", () => require("next/dist/server/runtime-reacts.external.js"));

module.exports = mod;
}),
"[project]/lib/data.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "WA_NUMBER",
    ()=>WA_NUMBER,
    "categories",
    ()=>categories,
    "money",
    ()=>money,
    "seedCustomers",
    ()=>seedCustomers,
    "seedProducts",
    ()=>seedProducts,
    "today",
    ()=>today
]);
const categories = [
    'Attar & Perfumes',
    'Gift Items',
    'Home Decor',
    'Islamic Products',
    'Craft Works',
    'Personal Care',
    'Combo Packs'
];
const seedProducts = [
    {
        id: 1,
        name: 'Oud Al Haramain',
        category: 'Attar & Perfumes',
        price: 1200,
        expense: 650,
        stock: 15,
        image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=700&q=80',
        active: true
    },
    {
        id: 2,
        name: 'Rose Attar',
        category: 'Attar & Perfumes',
        price: 850,
        expense: 420,
        stock: 22,
        image: 'https://images.unsplash.com/photo-1615634260167-c8cdede054de?auto=format&fit=crop&w=700&q=80',
        active: true
    },
    {
        id: 3,
        name: 'Musk Al Tahara',
        category: 'Attar & Perfumes',
        price: 950,
        expense: 500,
        stock: 18,
        image: 'https://images.unsplash.com/photo-1547887538-e3a2f32cb1cc?auto=format&fit=crop&w=700&q=80',
        active: true
    },
    {
        id: 4,
        name: 'Sandalwood Attar',
        category: 'Attar & Perfumes',
        price: 780,
        expense: 410,
        stock: 8,
        image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=700&q=80',
        active: true
    },
    {
        id: 5,
        name: 'Amber Bliss',
        category: 'Attar & Perfumes',
        price: 1050,
        expense: 560,
        stock: 12,
        image: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=700&q=80',
        active: true
    },
    {
        id: 6,
        name: 'Handmade Resin Frame',
        category: 'Gift Items',
        price: 650,
        expense: 300,
        stock: 30,
        image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=700&q=80',
        active: true
    },
    {
        id: 7,
        name: 'Decorative Lantern',
        category: 'Home Decor',
        price: 900,
        expense: 470,
        stock: 14,
        image: 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=700&q=80',
        active: true
    },
    {
        id: 8,
        name: 'Islamic Wall Art',
        category: 'Islamic Products',
        price: 1800,
        expense: 900,
        stock: 15,
        image: 'https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&w=700&q=80',
        active: true
    },
    {
        id: 9,
        name: 'Customized Gift Box',
        category: 'Gift Items',
        price: 650,
        expense: 300,
        stock: 30,
        image: 'https://images.unsplash.com/photo-1512909006721-3d6018887383?auto=format&fit=crop&w=700&q=80',
        active: true
    },
    {
        id: 10,
        name: 'Wooden Craft Piece',
        category: 'Craft Works',
        price: 1200,
        expense: 700,
        stock: 10,
        image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=700&q=80',
        active: true
    },
    {
        id: 11,
        name: 'Tasbih (Prayer Beads)',
        category: 'Islamic Products',
        price: 400,
        expense: 180,
        stock: 30,
        image: 'https://images.unsplash.com/photo-1609602644875-1c4d9c1e6f5d?auto=format&fit=crop&w=700&q=80',
        active: true
    },
    {
        id: 12,
        name: 'Luxury Gift Set',
        category: 'Combo Packs',
        price: 2500,
        expense: 1400,
        stock: 6,
        image: 'https://images.unsplash.com/photo-1549465220-1a8f9238cd48?auto=format&fit=crop&w=700&q=80',
        active: true
    }
];
const seedCustomers = [
    
];
const money = (n)=>`₹ ${Number(n || 0).toLocaleString('en-IN')}`;
const today = ()=>new Date().toLocaleString('en-IN', {
        dateStyle: 'short',
        timeStyle: 'short'
    });
const WA_NUMBER = '919999999999';
}),
"[project]/lib/store.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "StoreProvider",
    ()=>StoreProvider,
    "useStore",
    ()=>useStore,
    "useToast",
    ()=>useToast
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/data.ts [app-ssr] (ecmascript)");
'use client';
;
;
;
const Store = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])(null);
function usePersist(key, initial) {
    const [v, setV] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(initial);
    const [ready, setReady] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        try {
            const x = localStorage.getItem(key);
            if (x) setV(JSON.parse(x));
        } catch  {}
        setReady(true);
    }, [
        key
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (ready) localStorage.setItem(key, JSON.stringify(v));
    }, [
        key,
        v,
        ready
    ]);
    return [
        v,
        setV
    ];
}
function StoreProvider({ children }) {
    const [products, setProducts] = usePersist('noor_products_v3', __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["seedProducts"]);
    const [customers, setCustomers] = usePersist('noor_customers_v3', __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["seedCustomers"]);
    const [bills, setBills] = usePersist('noor_bills_v3', []);
    const [stockLogs, setStockLogs] = usePersist('noor_stock_logs_v3', []);
    const [role, setRole] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('admin');
    const [logged, setLogged] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const r = localStorage.getItem('noor_role');
        if (r) {
            setRole(r);
            setLogged(true);
        }
    }, []);
    const toast = (s)=>{
        window.dispatchEvent(new CustomEvent('noor-toast', {
            detail: s
        }));
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Store.Provider, {
        value: {
            products,
            setProducts,
            customers,
            setCustomers,
            bills,
            setBills,
            stockLogs,
            setStockLogs,
            role,
            setRole,
            logged,
            setLogged,
            toast
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/lib/store.tsx",
        lineNumber: 7,
        columnNumber: 640
    }, this);
}
function useStore() {
    const c = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(Store);
    if (!c) throw new Error('StoreProvider missing');
    return c;
}
function useToast() {
    const [s, setS] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const f = (e)=>{
            setS(e.detail);
            setTimeout(()=>setS(''), 2200);
        };
        window.addEventListener('noor-toast', f);
        return ()=>window.removeEventListener('noor-toast', f);
    }, []);
    return s;
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__07vq7tv._.js.map
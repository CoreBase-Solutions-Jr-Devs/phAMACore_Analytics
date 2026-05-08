// Import Images
import product1 from "../../assets/images/products/img-1.png";
import product2 from "../../assets/images/products/img-2.png";
import product3 from "../../assets/images/products/img-3.png";
import product4 from "../../assets/images/products/img-4.png";
import product5 from "../../assets/images/products/img-5.png";

import company1 from "../../assets/images/companies/img-1.png";
import company2 from "../../assets/images/companies/img-2.png";
import company3 from "../../assets/images/companies/img-3.png";
import company5 from "../../assets/images/companies/img-5.png";
import company8 from "../../assets/images/companies/img-8.png";

import avatar1 from "../../assets/images/users/avatar-1.jpg";
import avatar2 from "../../assets/images/users/avatar-2.jpg";
import avatar3 from "../../assets/images/users/avatar-3.jpg";
import avatar4 from "../../assets/images/users/avatar-4.jpg";
import avatar6 from "../../assets/images/users/avatar-6.jpg";

const ecomWidgets = [
    {
        id: 1,
        label: "Total Spend",
        counter: "12.4",
        link: "Budgeted: 14.0M (89%)",
        decimals: 1,
        prefix: "KES ",
        suffix: "M",
        textColor: "white"
    },
    {
        id: 2,
        label: "Budget Left",
        counter: "1.6",
        link: "11% unused",
        decimals: 1,
        prefix: "KES ",
        suffix: "M",
        textColor: "success"
    },
    {
        id: 3,
        label: "Active Suppliers",
        counter: "5",
        link: "2 approved, 3 secondary",
        decimals: 0,
        prefix: "",
        suffix: "",
        textColor: "white"
    },
    {
        id: 4,
        label: "Price Alerts",
        counter: "4",
        link: "Products up >5%",
        decimals: 0,
        prefix: "",
        suffix: "",
        textColor: "danger"
    },
    {
        id: 5,
        label: "Maverick Spend",
        counter: "340",
        link: "2.7% of total",
        decimals: 0,
        prefix: "KES ",
        suffix: "K",
        textColor: "warning"
    },
    {
        id: 6,
        label: "Avg lead time",
        counter: "4.2",
        link: "Target: 3 days",
        decimals: 1,
        prefix: "",
        suffix: " days",
        textColor: "warning"
    }
];
const bestSellingProducts = [
    {
        id: 1,
        img: product1,
        label: "Branded T-Shirts",
        date: "24 Apr 2021",
        price: 29.0,
        orders: 62,
        stock: 510,
        amount: 1798,
    },
    {
        id: 2,
        img: product2,
        label: "Bentwood Chair",
        date: "19 Mar 2021",
        price: 85.2,
        orders: 35,
        amount: 2982,
    },
    {
        id: 3,
        img: product3,
        label: "Borosil Paper Cup",
        date: "01 Mar 2021",
        price: 14.0,
        orders: 80,
        stock: 749,
        amount: 1120,
    },
    {
        id: 4,
        img: product4,
        label: "One Seater Sofa",
        date: "11 Feb 2021",
        price: 127.5,
        orders: 56,
        amount: 7140,
    },
    {
        id: 5,
        img: product5,
        label: "Stillbird Helmet",
        date: "17 Jan 2021",
        price: 54,
        orders: 74,
        stock: 805,
        amount: 3996,
    },
];

const topSellers = [
    {
        id: 1,
        img: company1,
        label: "iTest Factory",
        name: "Oliver Tyler",
        product: "Bags and Wallets",
        stock: 8547,
        amount: 541200,
        percentage: 32,
    },
    {
        id: 2,
        img: company2,
        label: "Digitech Galaxy",
        name: "John Roberts",
        product: "Watches",
        stock: 895,
        amount: 75030,
        percentage: 79,
    },
    {
        id: 3,
        img: company3,
        label: "Nesta Technologies",
        name: "Harley Fuller",
        product: "Bike Accessories",
        stock: 3470,
        amount: 45600,
        percentage: 90,
    },
    {
        id: 4,
        img: company8,
        label: "Zoetic Fashion",
        name: "James Bowen",
        product: "Clothes",
        stock: 5488,
        amount: 29456,
        percentage: 40,
    },
    {
        id: 5,
        img: company5,
        label: "Meta4Systems",
        name: "Zoe Dennis",
        product: "Furniture",
        stock: 4100,
        amount: 11260,
        percentage: 57,
    },
];

const recentOrders = [
  {
    id: 1,
    supplier: "Cosmos Ltd",
    invoice: "INV-COS-2026-0318",
    amount: "KES 480K",
    dueDate: "Apr 14",
    daysOverdue: "15 days",
    terms: "Net 30",
    action: "Pay today",
    actionClass: "danger",
  },
  {
    id: 2,
    supplier: "Biodeal Ltd",
    invoice: "INV-BIO-2026-0214",
    amount: "KES 312K",
    dueDate: "Apr 20",
    daysOverdue: "9 days",
    terms: "Net 30",
    action: "Pay today",
    actionClass: "danger",
  },
  {
    id: 3,
    supplier: "Elys Chemicals",
    invoice: "INV-ELY-2026-0098",
    amount: "KES 148K",
    dueDate: "Apr 26",
    daysOverdue: "3 days",
    terms: "Net 45",
    action: "Pay this week",
    actionClass: "warning",
  },
];

const topCategories = [
    {
        id: 1,
        category: "Mobile & Accessories",
        total: "10,294",
    },
    {
        id: 2,
        category: "Desktop",
        total: "6,256",
    },
    {
        id: 3,
        category: "Electronics",
        total: "3,479",
    },
    {
        id: 4,
        category: "Home & Furniture",
        total: "2,275",
    },
    {
        id: 5,
        category: "Grocery",
        total: "1,950",
    },
    {
        id: 6,
        category: "Fashion",
        total: "1,582",
    },
    {
        id: 7,
        category: "Appliances",
        total: "1,037",
    },
    {
        id: 8,
        category: "Beauty, Toys & More",
        total: "924",
    },
    {
        id: 9,
        category: "Food & Drinks",
        total: "701",
    },
    {
        id: 10,
        category: "Toys & Games",
        total: "239",
    },
];

// Revenue Chart Data
const allRevenueData = [
    {
        name: "Actual Spend",
        type: "bar",
        data: [
            12.4, 15.8, 10.6, 18.2, 14.7, 16.3,
            11.9, 9.5, 17.1, 13.2, 16.8, 14.1,
        ],
    },
    {
        name: "Budget",
        type: "line",
        data: [1.2, 1.8, 1.1, 2.4, 2.8, 1.6, 0.9, 1.3, 1.1, 3.2, 1.7, 3.8],
    },
];

const monthRevenueData = [
    {
        name: "Actual Spend",
        type: "bar",
        data: [
            14.2, 16.5, 12.8, 19.1, 15.3, 17.4,
            13.2, 10.1, 18.6, 14.8, 17.9, 15.6,
        ],
    },
    {
        name: "Budget",
        type: "line",
        data: [1.9, 2.4, 2.8, 3.6, 4.1, 2.2, 1.5, 1.8, 2.5, 2.1, 2.6, 4.4],
    },
];

const halfYearRevenueData = [
    {
        name: "Actual Spend",
        type: "bar",
        data: [
            16.8, 18.2, 14.9, 20.6, 17.1, 18.4,
            15.2, 12.6, 19.3, 16.4, 18.8, 17.2,
        ],
    },
    {
        name: "Budget",
        type: "line",
        data: [1.1, 2.7, 3.9, 4.5, 4.2, 3.1, 1.4, 1.8, 4.1, 4.6, 3.3, 5.2],
    },
];

const yearRevenueData = [
    {
        name: "Actual Spend",
        type: "bar",
        data: [
            18.5, 17.3, 16.1, 22.4, 19.6, 21.3,
            15.8, 14.9, 23.1, 17.6, 19.2, 20.4,
        ],
    },
    {
        name: "Budget",
        type: "line",
        data: [2.8, 2.1, 2.5, 3.8, 4.6, 1.9, 1.3, 4.1, 1.8, 3.2, 3.9, 4.4],
    },
];

export { ecomWidgets, bestSellingProducts, topSellers, recentOrders, topCategories, allRevenueData, monthRevenueData, halfYearRevenueData, yearRevenueData };
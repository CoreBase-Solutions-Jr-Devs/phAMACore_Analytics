import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const Navdata = () => {
  const history = useNavigate();
  const branch = "default-branch";
const filters = { branch: "default-branch" };

const salesBranch = useSelector(
  (state) => state.powerbi?.filters?.branch
);

const purchaseBranch = useSelector(
  (state) => state.PurchaseOrders?.filters?.branch
);

  // States
  const [isDashboard, setIsDashboard] = useState(false);
  const [isSales, setIsSales] = useState(false);
  const [isStock, setIsStock] = useState(false);
  const [isPurchaseOrders, setIsPurchaseOrders] = useState(false);
  const [isMyBusiness, setIsMyBusiness] = useState(false);
  const [iscurrentState, setIscurrentState] = useState('Dashboard');

  // Fixed DOM manipulation safety checks
  function updateIconSidebar(e) {
    if (e && e.target && e.target.getAttribute('subitems')) {
      const ul = document.getElementById('two-column-menu');
      if (ul) {
        const iconItems = ul.querySelectorAll('.nav-icon.active');
        let activeIconItems = [...iconItems];
        activeIconItems.forEach((item) => {
          item.classList.remove('active');
          var id = item.getAttribute('subitems');
          if (document.getElementById(id)) {
            document.getElementById(id).classList.remove('show');
          }
        });
      }
    }
  }

  // Sync state visibility safely
  useEffect(() => {
    document.body.classList.remove('twocolumn-panel');
    
    if (iscurrentState !== 'Sales') setIsSales(false);
    if (iscurrentState !== 'Dashboard') setIsDashboard(false);
    if (iscurrentState !== 'Purchase-Orders') setIsPurchaseOrders(false);
    if (iscurrentState !== 'Stock') setIsStock(false);
    if (iscurrentState !== 'MyBusiness') setIsMyBusiness(false); // Fixed bug here
  }, [iscurrentState]);

  const menuItems = [
    {
      id: 'my business',
      label: 'My Business',
      icon: 'ri-home-4-line',
      link: '/dashboard',
      stateVariables: isMyBusiness,
      click: function (e) {
        e.preventDefault();
        setIsMyBusiness(!isMyBusiness); // Fixed bug here
        setIscurrentState('MyBusiness');
        updateIconSidebar(e);
      },
    },
    {
      id: 'sales',
      label: 'Sales',
      icon: 'ri-bar-chart-fill',
      link: '/#',
      stateVariables: isSales,
      click: function (e) {
        e.preventDefault();
        setIsSales(!isSales);
        setIscurrentState('Sales');
        updateIconSidebar(e);
      },
      subItems: [
        { id: 'dashboard', label: 'Dashboard', link: '/dashboard-sales', parentId: 'sales' },
        { id: 'branchview', label: 'BranchView', link: salesBranch ? `/dashboard-sales/branch/${salesBranch}` : '#', disabled: !salesBranch, parentId: 'sales' },
      ],
    },
    {
      id: 'stock',
      label: 'Inventory / Stock',
      icon: 'ri-box-3-line',
      link: '/#',
      stateVariables: isStock,
      click: function (e) {
        e.preventDefault();
        setIsStock(!isStock);
        setIscurrentState('Stock');
        updateIconSidebar(e);
      },
      subItems: [
        { id: 'dashboard-stock', label: 'Dashboard', link: '/dashboard-stock', parentId: 'stock' },
        { id: 'branchview-stock', label: 'BranchView', link: `/dashboard-sales/branch/${branch}`, parentId: 'stock' },
      ],
    },
    {
      id: 'purchase-orders',
      label: 'Purchase-Orders',
      icon: 'ri-todo-line',
      link: '/#',
      stateVariables: isPurchaseOrders,
      click: function (e) {
        e.preventDefault();
        setIsPurchaseOrders(!isPurchaseOrders);
        setIscurrentState('Purchase-Orders');
        updateIconSidebar(e);
      },
      subItems: [
        { id: 'dashboard-purchase-orders', label: 'Dashboard', link: '/dashboard-purchase-orders', parentId: 'purchase-orders' },
        { id: 'branchview-purchase-orders', label: 'BranchView',link: purchaseBranch
    ? `/dashboard-purchase-orders/branch/${purchaseBranch}`
    : '#',
  disabled: !purchaseBranch, parentId: 'purchase-orders' },
      ],
    },
  ];

 
  return <React.Fragment>{menuItems}</React.Fragment>;
};

export default Navdata;

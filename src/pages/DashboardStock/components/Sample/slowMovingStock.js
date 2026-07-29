import moment from "moment";

export const mockSlowMovingStock = [
    {
        movement_date: moment().subtract(18, "days").format("YYYY-MM-DD"),
        item_Code: "CHL004",
        item_Name: "Chlorpheniramine 4mg",
        quantity: 0,
    },
    {
        movement_date: moment().subtract(28, "days").format("YYYY-MM-DD"),
        item_Code: "FER200",
        item_Name: "Ferrous Sulphate 200mg",
        quantity: 4,
    },
    {
        movement_date: moment().subtract(26, "days").format("YYYY-MM-DD"),
        item_Code: "HYDCRM",
        item_Name: "Hydrocortisone Cream",
        quantity: 2,
    },
    {
        movement_date: moment().subtract(22, "days").format("YYYY-MM-DD"),
        item_Code: "ZINC20",
        item_Name: "Zinc Sulphate Tabs",
        quantity: 6,
    },
    {
        movement_date: moment().subtract(11, "days").format("YYYY-MM-DD"),
        item_Code: "CAL200",
        item_Name: "Calamine Lotion 200ml",
        quantity: 1,
    },
];
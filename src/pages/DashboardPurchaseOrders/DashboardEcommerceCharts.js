import React from "react";
import ReactApexChart from "react-apexcharts";
import getChartColorsArray from "../../Components/Common/ChartsDynamicColor";

const RevenueCharts = ({ dataColors, series, categories = [] }) => {
  const colors = getChartColorsArray(dataColors);
const currentMonth = new Date().toLocaleString("en-US", {
  month: "short",
});

const currentMonthExists = categories.includes(currentMonth);
  const options = {
    chart: {
      height: 370,
      type: "line",
      toolbar: {
        show: false,
      },
    },

    stroke: {
      curve: "straight",
      width: 2,
      dashArray: [0, 6],
    },

    dataLabels: {
      enabled: false,
    },

    colors: [colors[0], colors[0]],

    legend: {
      show: false,
    },

    xaxis: {
      categories,

      axisTicks: {
        show: false,
      },

      axisBorder: {
        show: false,
      },
        labels: {
    formatter: (value) => {
      const monthIndex = categories.indexOf(value);
      return monthIndex % 2 === 0 ? value : "";
    },
  },
    },

    yaxis: {
         title: {
        text: "Purchases (KES)",
      },
      min: 0,
      forceNiceScale: true,
      tickAmount: 5,

      labels: {
        formatter: (val) => Number(val).toLocaleString(),
      },
    },

    tooltip: {
      y: {
        formatter: (val) => Number(val).toLocaleString(),
      },
    },
    tooltip: {
  x: {
    formatter: (value, { dataPointIndex }) => {
      return categories[dataPointIndex];
    },
  },
  y: {
    formatter: (val) => Number(val || 0).toLocaleString("en-KE"),
  },
},

annotations: {
  xaxis: currentMonthExists
    ? [
        {
          x: currentMonth,
          borderColor: "#C68E45",
          strokeDashArray: 2,
          borderWidth: 2,
          label: {
            text: "currentMonth",
            position: "top",
            orientation: "horizontal",
            borderColor: "#C68E45",
             padding: "2px 6px",
                borderRadius: "4px",
            style: {
              color: "#fff",
              background: "#C68E45",
              fontSize: "11px",
            },
          },
        },
      ]
    : [],
},
  };

  return (
    <ReactApexChart
      options={options}
      series={series}
      type="line"
      height={350}
    />
  );
};

const MonthToDateCharts = ({
  dataColors,
  series,
  categories = [],
  formatAmount,
}) => {
  const colors = getChartColorsArray(dataColors);


  const today = new Date().getDate();

  const currentDate = categories.find(
    (date) => Number(date) === today
  );

  const todayIndex = categories.findIndex(
    (date) => Number(date) === today
  );

  const options = {
    chart: {
      height: 370,
      type: "line",
      toolbar: {
        show: false,
      },
    },

    stroke: {
      curve: "straight",
      width: 2,
      dashArray: [0, 6],
    },

    dataLabels: {
      enabled: false,
    },

    colors: [colors[0], colors[0]],

    legend: {
      show: false,
    },

    xaxis: {
      categories,

      axisTicks: {
        show: false,
      },

      axisBorder: {
        show: false,
      },
       labels: {
    formatter: (value) => {
      const day = Number(value);
      return day === 1 || day % 5 === 0 ? day : "";
    },
  },
    },

    yaxis: {
        title: {
        text: "Purchases (KES)",
      },
      min: 0,
      forceNiceScale: true,
      tickAmount: 5,

      labels: {
        formatter: (val) => Number(val || 0).toLocaleString("en-KE"),
      },
    },

tooltip: {
  x: {
    formatter: (value) => `Day ${value}`,
  },
  y: {
    formatter: (val) =>
      Number(val || 0).toLocaleString("en-KE"),
  },
},
  };

  return (
  
   <div style={{ position: "relative" }}>
    <ReactApexChart
      options={options}
      series={series}
      type="line"
      height={350}
    />
  
    <div
      style={{
        position: "absolute",
        top: 35,
        bottom: 55,
      left: `calc(60px + ${
  (todayIndex / (categories.length - 1)) * 85
}%)`,
        borderLeft: "2px dotted #C68E45",
        pointerEvents: "none",
        zIndex: 5,
      }}
    />
        <div
        style={{
          position: "absolute",
          top: 10,
          left: `calc(60px + ${(todayIndex / (categories.length - 1)) * 85}%)`,
          transform: "translateX(-50%)",
          color: "#fff",
          fontSize: "11px",
          backgroundColor: "#C68E45",
          padding: "2px 6px",
          borderRadius: "4px",
          // fontWeight: 500,
          pointerEvents: "none",
          zIndex: 6,
        }}
      >
        Today
      </div>
  </div>
    );
  };

const SpendCharts = ({ dataColors, series, categories, formatAmount }) => {
  let barchartCountriesColors = [];

  try {
    barchartCountriesColors = dataColors ? getChartColorsArray(dataColors) : [];
  } catch (error) {
    console.warn("Chart colors parsing failed:", error);
    barchartCountriesColors = ["#f06548"];
  }

  const validSeries = React.useMemo(() => {
    if (!series || !Array.isArray(series)) return [{ data: [] }];

    return series.map((s) => ({
      ...s,
    }));
  }, [series]);

  const options = {
    chart: {
      type: "bar",
      height: 300,
      toolbar: {
        show: false,
      },
    },

    plotOptions: {
      bar: {
        borderRadius: 2,
        horizontal: true,
        distributed: true,
        barHeight: "65%",
        dataLabels: {
          position: "right",
        },
      },
    },

    colors: barchartCountriesColors,

    dataLabels: {
      enabled: true,
      textAnchor: "start",
      offsetX: 15,
      formatter: (val) => formatAmount(val),

      style: {
        // fontSize: "12px",
        fontWeight: 300,
        padding: "10px",
        colors: ["#495057"],
      },
    },

    tooltip: {
      y: {
        formatter: (val) => `KES ${formatAmount(val)}`,
      },
    },

    legend: {
      show: false,
    },

    grid: {
      show: false,
      padding: {
        left: 50, // increase if names are still cut off
      },
    },

    xaxis: {
      categories: categories || [],

      labels: {
        show: false,
      },

      axisTicks: {
        show: false,
      },

      axisBorder: {
        show: false,
      },
    },

    yaxis: {
      labels: {
        maxWidth: 250,
        style: {
          fontSize: "13px",
          fontWeight: 600,
          colors: ["#495057"], // dark gray
          // fontFamily: "inherit", // optional
        },
      },
    },
  };

  return (
    <ReactApexChart
      dir="ltr"
      options={options}
      series={validSeries}
      type="bar"
      height={500}
      className="apex-charts"
    />
  );
};


const StoreVisitsCharts = ({
  dataColors,
  categories = [],
  series = [],
  formatAmount,
  amounts = [],
}) => {
  const chartColors = getChartColorsArray(dataColors);

  // Use actual spend amounts for the bars
  const barData = amounts.length ? amounts : series;

  const options = {
    chart: {
      height: 350,
      type: "line",
      toolbar: {
        show: false,
      },
    },

    legend: {
      show: false,
    },

    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "70%",
        borderRadius: 0,
        distributed: false,
      },
    },

    stroke: {
      width: [0, 3],
      curve: "straight",
      dashArray: [0, 5],
    },

    dataLabels: {
      enabled: false,
    },

    xaxis: {
      categories,
      labels: {
        rotate: -45,
        rotateAlways: true,
        trim: false,
        hideOverlappingLabels: false,
        minHeight: 100,
        maxHeight: 160,
        style: {
          fontSize: "10px",
        },
      },
    },

    yaxis: {
      title: {
        text: "Spend (KES)",
      },
      labels: {
        formatter: (value) =>
          Number(value || 0).toLocaleString("en-KE"),
      },
    },

   tooltip: {
  shared: true,
  intersect: false,
  enabledOnSeries: [0, 1],

  x: {
    formatter: (value, { dataPointIndex }) =>
      categories[dataPointIndex] || value,
  },

  y: {
    formatter: (value) =>
      `KES ${Number(value || 0).toLocaleString("en-KE", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
  },
},

    colors: [chartColors[0], chartColors[0]],
  };

  const mixedSeries = [
    {
      name: "Spend",
      type: "bar",
      data: barData,
    },
    {
      name: "Spend Trend",
      type: "line",
      data: barData,
    },
  ];

  return (
    <ReactApexChart
      options={options}
      series={mixedSeries}
      type="line"
      height={350}
    />
  );
};


export { RevenueCharts, StoreVisitsCharts, SpendCharts, MonthToDateCharts };

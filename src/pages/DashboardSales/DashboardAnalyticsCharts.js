import React from "react";
import ReactApexChart from "react-apexcharts";

import getChartColorsArray from "../../Components/Common/ChartsDynamicColor";

const AudiencesCharts = ({ dataColors, series }) => {
  let chartAudienceColumnChartsColors = [];
  try {
    chartAudienceColumnChartsColors = dataColors
      ? getChartColorsArray(dataColors)
      : [];
  } catch (error) {
    console.warn("Chart colors parsing failed:", error);
    chartAudienceColumnChartsColors = ["#8c68cd", "#40bb82"];
  }

  // Ensure series data is mutable
  const validSeries = React.useMemo(() => {
    if (!series || !Array.isArray(series)) return [{ data: [] }];
    return series.map((s) => ({ ...s }));
  }, [series]);

  var options = {
    chart: {
      type: "bar",
      height: 309,
      stacked: true,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "20%",
        borderRadius: 6,
      },
    },
    dataLabels: {
      enabled: false,
    },
    legend: {
      show: true,
      position: "bottom",
      horizontalAlign: "center",
      fontWeight: 400,
      fontSize: "8px",
      offsetX: 0,
      offsetY: 0,
      markers: {
        width: 9,
        height: 9,
        radius: 4,
      },
    },
    stroke: {
      show: true,
      width: 2,
      colors: ["transparent"],
    },
    grid: {
      show: false,
    },
    colors: chartAudienceColumnChartsColors,
    xaxis: {
      categories: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
      axisTicks: {
        show: false,
      },
      axisBorder: {
        show: true,
        strokeDashArray: 1,
        height: 1,
        width: "100%",
        offsetX: 0,
        offsetY: 0,
      },
    },
    yaxis: {
      show: false,
    },
    fill: {
      opacity: 1,
    },
  };
  return (
    <React.Fragment>
      <ReactApexChart
        dir="ltr"
        options={options}
        series={validSeries}
        type="bar"
        height={309}
        className="apex-charts"
      />
    </React.Fragment>
  );
};

const AudiencesSessionsCharts = ({ dataColors, series }) => {
  let chartHeatMapBasicColors = [];
  try {
    chartHeatMapBasicColors = dataColors ? getChartColorsArray(dataColors) : [];
  } catch (error) {
    console.warn("Chart colors parsing failed:", error);
    chartHeatMapBasicColors = ["#f06548", "#40bb82"];
  }

  // Ensure series data is mutable
  const validSeries = React.useMemo(() => {
    if (!series || !Array.isArray(series)) return [{ data: [] }];
    return series.map((s) => ({ ...s }));
  }, [series]);

  var options = {
    chart: {
      height: 400,
      type: "heatmap",
      offsetX: 0,
      offsetY: -8,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      heatmap: {
        colorScale: {
          ranges: [
            {
              from: 0,
              to: 50,
              color: chartHeatMapBasicColors[0],
            },
            {
              from: 51,
              to: 100,
              color: chartHeatMapBasicColors[1],
            },
          ],
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    legend: {
      show: true,
      horizontalAlign: "center",
      offsetX: 0,
      offsetY: 20,
      markers: {
        width: 20,
        height: 6,
        radius: 2,
      },
      itemMargin: {
        horizontal: 12,
        vertical: 0,
      },
    },
    colors: chartHeatMapBasicColors,
    tooltip: {
      y: [
        {
          formatter: function (y) {
            if (typeof y !== "undefined") {
              return y.toFixed(0) + "k";
            }
            return y;
          },
        },
      ],
    },
  };
  return (
    <React.Fragment>
      <ReactApexChart
        dir="ltr"
        options={options}
        series={validSeries}
        type="heatmap"
        height={400}
        className="apex-charts"
      />
    </React.Fragment>
  );
};

// ============================
// TopProductsCharts
// ============================

const TopProductsCharts = ({ dataColors, series, categories = [] }) => {
  const colors = getChartColorsArray(dataColors);

  const options = {
    chart: {
      type: "bar",
      height: 350,
      toolbar: { show: false },
      // offsetX: 0,
    },

    plotOptions: {
      bar: {
        borderRadius: 4,
        horizontal: true,
        distributed: true,
        dataLabels: {
          position: "top",
        },
      },
    },

    //   grid: {
    //     padding: {
    //       left: 0,
    //       right: 0,
    //       top: 0,
    //       bottom: 0,
    //     },
    //   },

    //   stroke: {
    //     show: false,
    //   },

    colors,

    dataLabels: {
      enabled: true,
      offsetX: 32,
      formatter: (val) => (isNaN(val) ? "0" : Number(val).toFixed(0)),
    },

    xaxis: {
      categories,
    },

    yaxis: {
      labels: {
        formatter: (val) => val,
        style: {
          fontSize: "12px",
        },
      },
    },

    legend: {
      show: false,
    },
    labels: {
      show: false,
    },
    axisTicks: {
      show: false,
    },
    axisBorder: {
      show: false,
    },
    grid: {
      show: false,
    },
  };

  return (
    <ReactApexChart options={options} series={series} type="bar" height={350} />
  );
};

const ProgressiveSalesChart = ({
  dataColors,
  series,
  categories = [],
  salesVariance,
  salesGrowth,
  grossProfit,
  CostOfGoods,
  formatAmount,
}) => {
  const colors = getChartColorsArray(dataColors);
  const today = new Date();

  const currentMonth = today.toLocaleString("en-GB", {
    month: "short",
  });

  const currentMonthName = today.toLocaleString("en-GB", {
    month: "long",
  });

  const currentMonthExists = categories.includes(currentMonth);
  const getLastValidPoint = (data) =>
    data.findLastIndex((value) => Number(value) > 0);

  const currentYearIndex = categories.length - 1; // December
  const priorYearIndex = getLastValidPoint(series[1]?.data || []);
  const options = {
    chart: {
      height: 370,
      type: "line",
      toolbar: {
        show: false,
      },
      zoom: { enabled: true },
    },
    colors: [colors[0], colors[0]],

    stroke: {
      curve: "straight",
      width: 2,
      dashArray: [0, 6],
    },

    // dataLabels: {
    //   enabled: true,

    //   formatter: function (value, { seriesIndex, dataPointIndex }) {
    //     // 2026 at December
    //     if (seriesIndex === 0 && dataPointIndex === currentYearIndex) {
    //       return `${today.getFullYear()}`;
    //     }

    //     // 2025 at its last valid point
    //     if (seriesIndex === 1 && dataPointIndex === priorYearIndex) {
    //       return `${today.getFullYear() - 1}`;
    //     }

    //     return "";
    //   },

    //   background: {
    //     enabled: true,
    //     foreColor: "#fff",
    //     borderRadius: 4,
    //     padding: 5,
    //     opacity: 1,
    //     borderWidth: 0,
    //   },

    //   style: {
    //     fontSize: "12px",
    //     fontWeight: 600,
    //     colors: [
    //       colors[0], // 2026 label
    //       colors[0], // 2025 label
    //     ],
    //   },

    //   offsetY: -12,
    // },

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
    legend: {
      show: false,
    },

    tooltip: {
      shared: true,
      intersect: false,

      custom: function ({ dataPointIndex }) {
        const currentSales = series[0]?.data?.[dataPointIndex] ?? 0;
        const priorSales = series[1]?.data?.[dataPointIndex] ?? 0;

        const variance = salesVariance?.[dataPointIndex] ?? 0;
        const growth = salesGrowth?.[dataPointIndex];

        return `
      <div style="padding: 10px; font-size: 11px; min-width: 230px; background: #fff; color: #333; border-radius: 6px;">

        <div style="font-weight: 500; margin-bottom: 10px;">
          ${categories[dataPointIndex]}
        </div>

        <div style="margin-bottom: 5px;">
          ${series[0]?.name}:
          <strong>KES ${Number(currentSales).toLocaleString("en-KE")}</strong>
        </div>

        <div style="margin-bottom: 5px;">
          ${series[1]?.name}:
          <strong>KES ${Number(priorSales).toLocaleString("en-KE")}</strong>
        </div>

        <hr style="margin: 8px 0;" />

        <div style="margin-bottom: 5px;">
          Variance:
          <strong class="${Number(variance) >= 0 ? "text-success" : "text-danger"}">
            KES ${Number(variance).toLocaleString("en-KE")}
          </strong>
        </div>

        <div>
          Growth:
          <strong class="${Number(growth) >= 0 ? "text-success" : "text-danger"}">
            ${growth != null ? `${Number(growth).toFixed(2)}%` : "_"}
          </strong>
        </div>
<div style="margin-bottom: 5px;">
  Gross Profit:
  <strong class="${
    grossProfit == null || grossProfit === ""
      ? "text-muted"
      : Number(grossProfit) >= 0
        ? "text-success"
        : "text-danger"
  }">
    ${
      grossProfit == null || grossProfit === ""
        ? "_"
        : `KES ${Number(grossProfit).toLocaleString("en-KE")}`
    }
  </strong>
</div>

<div style="margin-bottom: 5px;">
  COGS:
  <strong class="${
    CostOfGoods == null || CostOfGoods === ""
      ? "text-muted"
      : Number(CostOfGoods) >= 0
        ? "text-success"
        : "text-danger"
  }">
    ${
      CostOfGoods == null || CostOfGoods === ""
        ? "_"
        : `KES ${Number(CostOfGoods).toLocaleString("en-KE")}`
    }
  </strong>
</div>
      </div>
    `;
      },
    },

    yaxis: {
      title: {
        text: "Sales (KES)",
      },
      min: 0,
      forceNiceScale: true,
      tickAmount: 5,

      labels: {
        formatter: (val) => Number(val || 0).toLocaleString("en-KE"),
      },
    },

    annotations: {
      xaxis: currentMonthExists
        ? [
            {
              x: currentMonth,
              borderColor: "#C68E45",
              strokeDashArray: 5,
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
                  // fontWeight: 500,
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

// const BranchPerformanceChart = ({ dataColors, series, categories = [] }) => {
//     let barchartCountriesColors = [];
//     try {
//         barchartCountriesColors = dataColors ? getChartColorsArray(dataColors) : [];
//     } catch (error) {
//         console.warn('Chart colors parsing failed:', error);
//         barchartCountriesColors = ['#f06548'];
//     }

//     // Ensure series data is mutable
//     const validSeries = React.useMemo(() => {
//         if (!series || !Array.isArray(series)) return [{ data: [] }];
//         return series.map((s) => ({ ...s }));
//     }, [series]);

//     var options = {
//         chart: {
//             type: 'bar',
//             height: 400,
//             toolbar: {
//                 show: false,
//             }
//         },
//         plotOptions: {
//             bar: {
//                 borderRadius: 4,
//                 horizontal: true,
//                 distributed: true,
//                 dataLabels: {
//                     position: 'top',
//                 },
//             }
//         },
//         colors: barchartCountriesColors,
//         dataLabels: {
//             enabled: true,
//             offsetX: 32,
//              formatter: (val) => `${val}M`,
//             style: {
//                 fontSize: '12px',
//                 fontWeight: 400,
//                 colors: ['#adb5bd']
//                 // colors:['#878a99']
//             }
//         },
// tooltip: {
//     y: {
//         formatter: (val) => `${val}M`
//     }
// },
//         legend: {
//             show: false,
//         },
//         grid: {
//             show: false,
//         },
// xaxis: {
//   categories,
//     labels: {
//         show: false
//     },
//     axisTicks: {
//         show: false
//     },
//     axisBorder: {
//         show: false
//     }
// },
//     };
//     return (
//         <React.Fragment>
//             <ReactApexChart dir="ltr"
//                 options={options}
//                 series={validSeries}
//                 type="bar"
//                 height={300}
//                 className="apex-charts"
//             />
//         </React.Fragment>
//     );
// };

const BranchPerformanceChart = ({
  dataColors,
  series = [],
  categories = [],
  trendData = [],
}) => {
  const chartColors = getChartColorsArray(dataColors);

  const barData = series[0]?.data || [];

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
      position: "top",
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

    // markers: {
    //   size: [0, 4],
    // },

    xaxis: {
      categories,
      //  title: {
      //       text: "Branches",
      //     },
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
        text: "Sales (KES)",
      },
      labels: {
        formatter: (value) => Number(value || 0).toLocaleString("en-KE"),
      },
    },

    tooltip: {
      shared: true,
      intersect: false,
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
      name: "Sales",
      type: "bar",
      data: barData,
    },
    {
      name: "Sales Trend",
      type: "line",
      data: trendData.length ? trendData : barData,
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

const MonthToDateSalesChart = ({
  dataColors,
  series,
  salesVariance,
  salesGrowth,
  CostOfGoods,
  grossProfit,
  formatAmount,
  categories = [],
}) => {
  const colors = getChartColorsArray(dataColors);

  const today = new Date();

  const todayDay = today.getDate();

  const todayLabel = today.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });

  const todayIndex = categories.findIndex((day) => Number(day) === todayDay);

  const options = {
    chart: {
      height: 350,
      type: "line",
      zoom: { enabled: true },
      toolbar: { show: false },
    },

    dataLabels: {
      enabled: false,
    },

    stroke: {
      curve: "straight",
      width: 2,
      dashArray: [0, 6],
    },

    colors: [colors[0], colors[0]],

    legend: {
      show: false,
    },

    tooltip: {
      shared: true,
      intersect: false,

      custom: function ({ dataPointIndex }) {
        const currentSales = series[0]?.data?.[dataPointIndex] ?? 0;
        const priorSales = series[1]?.data?.[dataPointIndex] ?? 0;

        const variance = salesVariance?.[dataPointIndex] ?? 0;
        const growth = salesGrowth?.[dataPointIndex];
        const profit = grossProfit?.[dataPointIndex];
        const cost = CostOfGoods?.[dataPointIndex];
        return `
      <div style="padding: 10px; font-size: 11px; min-width: 230px; background: #fff; color: #333; border-radius: 6px;">

        <div style="font-weight: 500; margin-bottom: 10px;">
          Day ${categories[dataPointIndex]}
        </div>

        <div style="margin-bottom: 5px;">
          ${series[0]?.name}:
          <strong>KES ${Number(currentSales).toLocaleString("en-KE")}</strong>
        </div>

        <div style="margin-bottom: 5px;">
          ${series[1]?.name}:
          <strong>KES ${Number(priorSales).toLocaleString("en-KE")}</strong>
        </div>

        <hr style="margin: 8px 0;" />

        <div style="margin-bottom: 5px;">
          Variance:
          <strong class="${Number(variance) >= 0 ? "text-success" : "text-danger"}">
            KES ${Number(variance).toLocaleString("en-KE")}
          </strong>
        </div>

        <div style="margin-bottom: 5px;">
          Growth:
          <strong class="${Number(growth) >= 0 ? "text-success" : "text-danger"}">
            ${growth != null ? `${Number(growth).toFixed(2)}%` : "_"}
          </strong>
        </div>
 <div style="margin-bottom: 5px;">
  Gross Profit:
  <strong class="${
    grossProfit == null || profit === ""
      ? "text-muted"
      : Number(profit) >= 0
        ? "text-success"
        : "text-danger"
  }">
    ${
      profit == null || profit === ""
        ? "_"
        : `KES ${Number(profit).toLocaleString("en-KE")}`
    }
  </strong>
</div>

<div style="margin-bottom: 5px;">
  COGS:
  <strong class="${
    cost == null || cost === ""
      ? "text-muted"
      : Number(cost) >= 0
        ? "text-success"
        : "text-danger"
  }">
    ${
      cost == null || cost === ""
        ? "_"
        : `KES ${Number(cost).toLocaleString("en-KE")}`
    }
  </strong>
</div>
       

      </div>
    `;
      },
    },

    grid: {
      padding: {
        bottom: 0,
      },
    },
    xaxis: {
      type: "category",
      categories,
      tickPlacement: "on",

      //   title: {
      //   text: `Days of ${today.toLocaleDateString("en-GB", {
      //     month: "long",
      //   })} ${today.getFullYear() - 1} vs ${today.getFullYear()}`,
      // },

      labels: {
        formatter: (value) => {
          const day = Number(value);
          return day === 1 || day % 5 === 0 ? day : "";
        },
      },
    },

    yaxis: {
      title: {
        text: "Sales (KES)",
      },
      min: 0,
      forceNiceScale: true,
      tickAmount: 5,
      labels: {
        formatter: (val) => Number(val || 0).toLocaleString("en-KE"),
      },
    },
    // annotations: {
    //   points: [
    //     {
    //       x: categories[categories.length - 1],
    //       y: series[0]?.data?.[series[0].data.length - 1],
    //       marker: {
    //         size: 0,
    //       },
    //       label: {
    //         text: "2026",
    //         borderColor: colors[0],
    //         offsetX: -15,
    //         offsetY: -12,
    //         style: {
    //           background: colors[0],
    //           color: "#fff",
    //           fontSize: "12px",
    //           fontWeight: 600,
    //         },
    //       },
    //     },
    //     {
    //       x: categories[categories.length - 1],
    //       y: series[1]?.data?.[series[1].data.length - 1],
    //       marker: {
    //         size: 0,
    //       },
    //       label: {
    //         text: "2025",
    //         borderColor: colors[0],
    //         offsetX: -15,
    //         offsetY: -12,
    //         style: {
    //           background: colors[0],
    //           color: "#fff",
    //           fontSize: "12px",
    //           fontWeight: 600,
    //         },
    //       },
    //     },
    //   ],
    // },
  };

  return (
    <div style={{ position: "relative" }}>
      <ReactApexChart
        options={options}
        series={series}
        type="line"
        height={350}
      />

      {/* Today vertical line */}
      <div
        style={{
          position: "absolute",
          top: 35,
          bottom: 55,
          left: `calc(70px + ${(todayIndex / (categories.length - 1)) * 85}%)`,
          borderLeft: "2px dotted #C68E45",
          pointerEvents: "none",
          zIndex: 5,
        }}
      />

      {/* Today label */}
      <div
        style={{
          position: "absolute",
          top: 10,
          left: `calc(70px + ${(todayIndex / (categories.length - 1)) * 85}%)`,
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

const CountriesCharts = ({ dataColors, series }) => {
  let barchartCountriesColors = [];
  try {
    barchartCountriesColors = dataColors ? getChartColorsArray(dataColors) : [];
  } catch (error) {
    console.warn("Chart colors parsing failed:", error);
    barchartCountriesColors = ["#f06548"];
  }

  // Ensure series data is mutable
  const validSeries = React.useMemo(() => {
    if (!series || !Array.isArray(series)) return [{ data: [] }];
    return series.map((s) => ({ ...s }));
  }, [series]);

  var options = {
    chart: {
      type: "bar",
      height: 436,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        horizontal: true,
        distributed: true,
        dataLabels: {
          position: "top",
        },
      },
    },
    colors: barchartCountriesColors,
    dataLabels: {
      enabled: true,
      offsetX: 32,
      style: {
        fontSize: "12px",
        fontWeight: 400,
        colors: ["#adb5bd"],
        // colors:['#878a99']
      },
    },

    legend: {
      show: false,
    },
    grid: {
      show: false,
    },
    xaxis: {
      categories: [
        "India",
        "United States",
        "China",
        "Indonesia",
        "Russia",
        "Bangladesh",
        "Canada",
        "Brazil",
        "Vietnam",
        "UK",
      ],
    },
  };
  return (
    <React.Fragment>
      <ReactApexChart
        dir="ltr"
        options={options}
        series={validSeries}
        type="bar"
        height={436}
        className="apex-charts"
      />
    </React.Fragment>
  );
};

const UsersByDeviceCharts = ({ dataColors, series }) => {
  let dountchartUserDeviceColors = [];
  try {
    dountchartUserDeviceColors = dataColors
      ? getChartColorsArray(dataColors)
      : [];
  } catch (error) {
    console.warn("Chart colors parsing failed:", error);
    dountchartUserDeviceColors = ["#f06548", "#40bb82", "#246bfd"];
  }

  // Ensure series data is mutable
  const validSeries = React.useMemo(() => {
    if (!series || !Array.isArray(series)) return [0, 0, 0];
    return series.map((item) => (typeof item === "number" ? item : 0));
  }, [series]);

  const options = {
    labels: ["Desktop", "Mobile", "Tablet"],
    chart: {
      type: "donut",
      height: 219,
    },
    plotOptions: {
      pie: {
        size: 100,
        donut: {
          size: "76%",
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    legend: {
      show: false,
      position: "bottom",
      horizontalAlign: "center",
      offsetX: 0,
      offsetY: 0,
      markers: {
        width: 20,
        height: 6,
        radius: 2,
      },
      itemMargin: {
        horizontal: 12,
        vertical: 0,
      },
    },
    stroke: {
      width: 0,
    },
    yaxis: {
      labels: {
        formatter: function (value) {
          return value + "k Users";
        },
      },
      tickAmount: 4,
      min: 0,
    },
    colors: dountchartUserDeviceColors,
  };
  return (
    <React.Fragment>
      <ReactApexChart
        dir="ltr"
        options={options}
        series={validSeries}
        type="donut"
        height={219}
        className="apex-charts"
      />
    </React.Fragment>
  );
};

export {
  AudiencesCharts,
  AudiencesSessionsCharts,
  ProgressiveSalesChart,
  MonthToDateSalesChart,
  BranchPerformanceChart,
  CountriesCharts,
  UsersByDeviceCharts,
  TopProductsCharts,
};

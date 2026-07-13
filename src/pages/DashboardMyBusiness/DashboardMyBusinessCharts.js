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

const RevenueExpensesChart = ({
  dataColors,
  series,
  categories = [],
}) => {
  const colors = getChartColorsArray(dataColors);

  const options = {
    chart: {
      height: 350,
      type: "line",
      toolbar: { show: false },
      zoom: { enabled: false },
    },

    stroke: {
      curve: "smooth",
      width: 3,
    },

    dataLabels: {
      enabled: false,
    },

    colors,

    xaxis: {
      categories,
    },

    yaxis: {
      min: 0,
      forceNiceScale: true,
      tickAmount: 5,
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
  formatAmount,
}) => {
  const chartDonutBasicColors =
    getChartColorsArray(dataColors);

  const options = {
    labels: categories,

    chart: {
      height: 333,
      type: "donut",
    },

   legend: {
  position: "bottom",
  formatter: (seriesName, opts) => {
    const value = opts.w.globals.series[opts.seriesIndex];
    return `${seriesName}: ${formatAmount(value)}`;
  },
},

    stroke: {
      show: false,
    },

    dataLabels: {
      enabled: true,
      formatter: (val) => `${formatAmount(val)}`,
      dropShadow: {
        enabled: false,
      },
    },

    tooltip: {
      y: {
        formatter: (val) => `${formatAmount(val)}`,
      },
    },

    colors: chartDonutBasicColors,
  };

  return (
    <ReactApexChart
      options={options}
      series={series}
      type="donut"
      height={333}
    />
  );
};

const MonthToDateSalesChart = ({
  dataColors,
  series,
  formatAmount,
  categories = [],
}) => {
  const colors = getChartColorsArray(dataColors);

  const options = {
    chart: {
      height: 350,
      type: "line",
      zoom: { enabled: false },
      toolbar: { show: false },
    },

    dataLabels: {
      enabled: false,
    },

    stroke: {
      curve: "smooth",
      width: 3,
    },

    colors,

    xaxis: {
      categories,
    },

    yaxis: {
      min: 0,
      forceNiceScale: true,
      tickAmount: 5,
      labels: {
        formatter: (val) => formatAmount(val),
      },
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

const StockPurchasesCharts = ({
  dataColors,
  series,
  categories,
}) => {
  const linechartcustomerColors = getChartColorsArray(dataColors);

  const options = {
    chart: {
      height: 370,
      type: "bar",
      toolbar: {
        show: false,
      },
    },

    plotOptions: {
      bar: {
        columnWidth: "50%",
        borderRadius: 4,
      },
    },

    dataLabels: {
      enabled: false,
    },

    xaxis: {
      categories: categories || [],
      axisTicks: { show: false },
      axisBorder: { show: false },
    },

    yaxis: {
      min: 0,
      forceNiceScale: true,
      tickAmount: 5,
    },

    colors: linechartcustomerColors,
  };

  return (
    <ReactApexChart
      dir="ltr"
      options={options}
      series={series}
      type="bar"
      height={370}
      className="apex-charts"
    />
  );
};

const SalesCollectionCharts = ({ dataColors, series, categories }) => {
  const colors = getChartColorsArray(dataColors);

  const options = {
    chart: {
      height: 374,
      type: "line",
      stacked: false,
      toolbar: {
        show: false,
      },
    },

    stroke: {
      curve: "smooth",
      width: [0, 0, 3], // only revenue line visible thicker
    },

    plotOptions: {
      bar: {
        columnWidth: "40%",
      },
    },

    fill: {
      opacity: [1, 1, 1],
    },

    dataLabels: {
      enabled: false,
    },

    xaxis: {
      categories: categories,
      axisTicks: { show: false },
      axisBorder: { show: false },
    },

    yaxis: {
      min: 0,
      forceNiceScale: true,
      tickAmount: 5,
    },

    legend: {
      show: true,
      position: "top",
    },

    colors,
  };

  return (
    <ReactApexChart
      options={options}
      series={series}
      type="line"
      height={374}
    />
  );
};



export {
  AudiencesCharts,
  AudiencesSessionsCharts,
  SalesCollectionCharts,
RevenueExpensesChart,
  MonthToDateSalesChart,
  StockPurchasesCharts,
  BranchPerformanceChart,
  CountriesCharts,
  UsersByDeviceCharts,
  TopProductsCharts,
};

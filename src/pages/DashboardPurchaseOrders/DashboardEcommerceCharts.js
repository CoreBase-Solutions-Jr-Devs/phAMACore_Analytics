import React from "react";
import ReactApexChart from "react-apexcharts";
import getChartColorsArray from "../../Components/Common/ChartsDynamicColor";

const RevenueCharts = ({
  dataColors,
  series,
  categories = [],
  formatAmount,
}) => {
  const colors = getChartColorsArray(dataColors);

 const options = {
  chart: {
    height: 370,
    type: "line",
    toolbar: {
      show: false,
    },
  },

  stroke: {
    curve: "smooth",
    width: 3,
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
  },

  yaxis: {
    min: 0,
    forceNiceScale: true,
    tickAmount: 5,

    labels: {
      formatter: (val) => formatAmount(val),
    },
  },

  tooltip: {
    y: {
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

const MonthToDateCharts = ({
  dataColors,
  series,
  categories = [],
  formatAmount,
}) => {
  const colors = getChartColorsArray(dataColors);

 const options = {
  chart: {
    height: 370,
    type: "line",
    toolbar: {
      show: false,
    },
  },

  stroke: {
    curve: "smooth",
    width: 3,
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
  },

  yaxis: {
    min: 0,
    forceNiceScale: true,
    tickAmount: 5,

    labels: {
      formatter: (val) => formatAmount(val),
    },
  },

  tooltip: {
    y: {
      formatter: (val) => formatAmount(val),
    },
  },
};

  return (
    <ReactApexChart
      // dir="ltr"
      options={options}
      series={series}
      type="line"
      height={350}
    />
  );
};

const SpendCharts = ({ dataColors, series, categories, formatAmount }) => {
  let barchartCountriesColors = [];

  try {
    barchartCountriesColors = dataColors
      ? getChartColorsArray(dataColors)
      : [];
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
  const chartPieBasicColors =
    getChartColorsArray(dataColors);

  console.log("Pie categories:", categories);
  console.log("Pie series:", series);
  console.log("Pie amounts:", amounts);

  const options = {
    labels: categories,

    chart: {
      height: 333,
      type: "donut",
    },

    legend: {
      position: "bottom",
      formatter: (seriesName, opts) => {
        const amount = amounts[opts.seriesIndex] || 0;

        return `${seriesName}: ${formatAmount(amount)}`;
      },
    },

    stroke: {
      show: false,
    },

    dataLabels: {
      enabled: true,
      formatter: (val) => `${val.toFixed(1)}%`,
      dropShadow: {
        enabled: false,
      },
    },

    tooltip: {
  y: {
    formatter: (val, { seriesIndex }) => {
      const amount = amounts[seriesIndex] || 0;

      return `KES ${formatAmount(amount)}`;
    },
  },
},

    colors: chartPieBasicColors,
  };

  return (
    <React.Fragment>
      <ReactApexChart
        options={options}
        series={series}
        type="donut"
        height="333"
      />
    </React.Fragment>
  );
};

export { RevenueCharts, StoreVisitsCharts, SpendCharts, MonthToDateCharts };

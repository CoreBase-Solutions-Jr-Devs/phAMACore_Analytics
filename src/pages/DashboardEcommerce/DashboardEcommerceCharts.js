import React from "react";
import ReactApexChart from "react-apexcharts";
import getChartColorsArray from "../../Components/Common/ChartsDynamicColor";

const RevenueCharts = ({ dataColors, series, categories }) => {
  var linechartcustomerColors = getChartColorsArray(dataColors);

  var options = {
    chart: {
      height: 370,
      type: "line",
      toolbar: {
        show: false,
      },
    },
   stroke: {
  curve: "smooth",
  dashArray: [0, 8],
  width: [0, 3],
},
  fill: {
  opacity: 1,
},
    markers: {
      size: [0, 0, 0],
      strokeWidth: 2,
      hover: {
        size: 4,
      },
    },
    xaxis: {
     categories: categories,
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
    show: true,
    formatter: (val) => `KES ${val.toFixed(1)}M`,
    style: {
      colors: "#878a99",
      fontSize: "11px",
    },
  },
},
   grid: {
  show: true,
  xaxis: {
    lines: {
      show: true,
    },
  },
  padding: {
    top: 0,
    right: -2,
    bottom: 15,
    left: 10,
  },
},

    legend: {
      show: true,
      horizontalAlign: "center",
      offsetX: 0,
      offsetY: -5,
      markers: {
        width: 9,
        height: 9,
        radius: 6,
      },
      itemMargin: {
        horizontal: 10,
        vertical: 0,
      },
    },
    plotOptions: {
      bar: {
        columnWidth: "70%",
        // barHeight: "70%",
      },
    },
    colors: linechartcustomerColors,
tooltip: {
  shared: true,
  y: [
    {
      formatter: function (y) {
        if (typeof y !== "undefined") {
          return `KES ${y.toFixed(1)}M`;
        }
        return y;
      },
    },
    {
      formatter: function (y) {
        if (typeof y !== "undefined") {
          return y.toFixed(0) + " Refunds";
        }
        return y;
      },
    },
  ],
},
  };
  return (
    <React.Fragment>
      <ReactApexChart dir="ltr"
        options={options}
        series={series}
        type="line"
        height="370"
        className="apex-charts"
      />
    </React.Fragment>
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

const StoreVisitsCharts = ({ dataColors }) => {
  var chartDonutBasicColors = getChartColorsArray(dataColors);
  const series = [44, 55, 41, 17, 15];
  var options = {
//    labels: [
//   "Antibiotics",
//   "ARVs",
//   "Antimalarials",
//   "Chronic Disease",
//   "OTC/Supp"
// ],

dataLabels: {
  enabled: true,
  formatter: (val) => `${val.toFixed(0)}%`,
  dropShadow: {
    enabled: false,
  },
},
    chart: {
      height: 333,
      type: "donut",
    },
    legend: {
      position: "bottom",
    },
    stroke: {
      show: false,
    },
    dataLabels: {
      dropShadow: {
        enabled: false,
      },
    },
    // colors: chartDonutBasicColors,
  };
  return (
    <React.Fragment>
      <ReactApexChart dir="ltr"
        options={options}
        series={series}
        type="donut"
        height="333"
        className="apex-charts"
      />
    </React.Fragment>
  );
};

export { RevenueCharts, StoreVisitsCharts, SpendCharts };

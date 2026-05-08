import React from "react";
import ReactApexChart from "react-apexcharts";
import getChartColorsArray from "../../Components/Common/ChartsDynamicColor";

const RevenueCharts = ({ dataColors, series }) => {
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
      curve: "straight",
     dashArray: [0, 8],
  width: [2, 2],
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
        show: false,
      },
    },
yaxis: {
  min: 0,
  max: 25,
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


const SpendCharts = ({ dataColors, series }) => {
    let barchartCountriesColors = [];
    try {
        barchartCountriesColors = dataColors ? getChartColorsArray(dataColors) : [];
    } catch (error) {
        console.warn('Chart colors parsing failed:', error);
        barchartCountriesColors = ['#f06548'];
    }

    // Ensure series data is mutable
    const validSeries = React.useMemo(() => {
        if (!series || !Array.isArray(series)) return [{ data: [] }];
        return series.map((s) => ({ ...s }));
    }, [series]);

    var options = {
        chart: {
            type: 'bar',
            height: 400,
            toolbar: {
                show: false,
            }
        },
        plotOptions: {
            bar: {
                borderRadius: 4,
                horizontal: true,
                distributed: true,
                dataLabels: {
                    position: 'top',
                },
            }
        },
        colors: barchartCountriesColors,
        dataLabels: {
            enabled: true,
            offsetX: 32,
             formatter: (val) => `${val}M`,
            style: {
                fontSize: '12px',
                fontWeight: 400,
                colors: ['#adb5bd']
                // colors:['#878a99']
            }
        },
tooltip: {
    y: {
        formatter: (val) => `${val}M`
    }
},
        legend: {
            show: false,
        },
        grid: {
            show: false,
        },
xaxis: {
    categories: [
        'Cosmos Ltd',
        'Biodeal Ltd',
        'Elys Chemicals',
        'Universal Corp',
        'PharmaChem EA'
    ],
    labels: {
        show: false
    },
    axisTicks: {
        show: false
    },
    axisBorder: {
        show: false
    }
},
    };
    return (
        <React.Fragment>
            <ReactApexChart dir="ltr"
                options={options}
                series={validSeries}
                type="bar"
                height={300}
                className="apex-charts"
            />
        </React.Fragment>
    );
};

const StoreVisitsCharts = ({ dataColors }) => {
  var chartDonutBasicColors = getChartColorsArray(dataColors);
  const series = [44, 55, 41, 17, 15];
  var options = {
   labels: [
  "Antibiotics",
  "ARVs",
  "Antimalarials",
  "Chronic Disease",
  "OTC/Supp"
],

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
    colors: chartDonutBasicColors,
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

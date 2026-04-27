import React from "react";
import ReactApexChart from "react-apexcharts";

const DashboardCharts = ({ seriesData, colors }) => {
  const validSeries = React.useMemo(() => {
    if (!seriesData || typeof seriesData !== 'number') return seriesData && seriesData.length > 0 ? [seriesData[0]] : [0];
    return [seriesData];
  }, [seriesData]);

  const options = {
        chart: {
            type: 'radialBar',
            width: 36,
            height: 36,
            sparkline: {
                enabled: !0
            }
        },
        dataLabels: {
            enabled: !1
        },
        plotOptions: {
            radialBar: {
                hollow: {
                    margin: 0,
                    size: '50%'
                },
                track: {
                    margin: 1
                },
                dataLabels: {
                    show: !1
                }
            }
        },
        colors: [colors]
    };
  return (
    <React.Fragment>
      <ReactApexChart dir="ltr"
        options={options}
        series={validSeries}
        type="radialBar"
        id="total_jobs"
        width={85}
        height={85}
        className="apex-charts"
      />
    </React.Fragment>
  );
};

export default DashboardCharts;

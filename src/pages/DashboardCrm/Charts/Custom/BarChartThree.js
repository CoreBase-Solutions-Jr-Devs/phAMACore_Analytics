import React from 'react';
import ReactApexChart from 'react-apexcharts';
import getChartColorsArray from '../../../../Components/Common/ChartsDynamicColor';

const BarChartThree = ({ dataColors }) => {
    var chartDatalabelsBarColors = getChartColorsArray(dataColors);
    const series = [{
        data: [28,25,31,17,13,5]
    }];
    var options = {
        chart: {
            type: 'bar',
            height: 350,
            toolbar: {
                show: false,
            }
        },
        plotOptions: {
            bar: {
                barHeight: '100%',
                distributed: true,
                horizontal: true,
                dataLabels: {
                    position: 'bottom'
                },
            }
        },
        colors: chartDatalabelsBarColors,
        dataLabels: {
            enabled: true,
            textAnchor: 'start',
            style: {
                colors: ['#fff']
            },
            formatter: function (val, opt) {
                return opt.w.globals.labels[opt.dataPointIndex] + ":  " + val;
            },
            offsetX: 0,
            dropShadow: {
                enabled: false
            }
        },
        stroke: {
            width: 1,
            colors: ['#fff']
        },
        xaxis: {
            categories: ['Nairobi CBD', 'Mombasa', 'Thika', 'Kisumu', 'Nakuru', 'Eldoret'],
        },
        yaxis: {
            labels: {
                show: false
            }
        },
        title: {
            text: 'Stock Value by Sales Velocity',
            align: 'left',
            floating: true,
            style: {
                fontWeight: 500,
            },
        },
        subtitle: {
            text: 'Target: 21-30 Days cover. Below 10 = critical replenishment needed.',
            align: 'left',
        },
        tooltip: {
            theme: 'dark',
            x: {
                show: false
            },
            y: {
                title: {
                    formatter: function () {
                        return '';
                    }
                }
            }
        }
    };
    return (
        <React.Fragment>
            <ReactApexChart dir="ltr"
                className="apex-charts"
                options={options}
                series={series}
                type="bar"
                height={350}
            />
        </React.Fragment>
    );
}

export default BarChartThree;

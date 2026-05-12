import React from 'react';
import ReactApexChart from 'react-apexcharts';
import getChartColorsArray from '../../../../../Components/Common/ChartsDynamicColor';

const BarChartThree = ({ dataColors }) => {
    var chartDatalabelsBarColors = getChartColorsArray(dataColors);
    const series = [{
        data: [892,850,762,641,598,521,477,412,385,349]
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
            categories: ['MedCare Mombasa', 'Pharmaplus Kiambu Rd', 'R.V. Dispensary', 'City Health Kisumu', 'Westlands Pharmacy',
                'Eldoret Med Centre', 'Nakuru Dispensary', 'Thika General Pharmacy', 'Coast Pharma Ltd', 'Karen Chemist',
            ],
        },
        yaxis: {
            labels: {
                show: false
            }
        },
        title: {
            text: 'Our Top Earning Customers',
            align: 'left',
            floating: true,
            style: {
                fontWeight: 500,
            },
        },
        subtitle: {
            text: 'Revenue Earned in Thousand(KES).',
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

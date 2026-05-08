import React from 'react';
import ReactApexChart from 'react-apexcharts';
import getChartColorsArray from '../../../../Components/Common/ChartsDynamicColor';

const BarChartOne = ({ dataColors }) => {
    var chartDatalabelsBarColors = getChartColorsArray(dataColors);
    const series = [{
        data: [2.2, 3.4, 4.1, 5.6, 6.3, 7.7, 11.9, 14.2, 18.9, 22.6]
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
            categories: ['ARVs(Tenofovir)', 'Amoxicillin 500mg', 'Co-Artem 20/120 mg', 'ORS Satchets', 'Metformin 500mg', 'Insulin Actrapid', 'Paracetamol 500mg',
                'Omeprazole 20mg', 'Ciproflaxin 250', 'Brufen'
            ],
        },
        yaxis: {
            labels: {
                show: false
            }
        },
        title: {
            text: 'Live stock VS Safety Minimum - Days of Cover Remaining',
            align: 'left',
            floating: true,
            style: {
                fontWeight: 500,
            },
        },
        subtitle: {
            text: 'Vertical line - reorder threshold(25% = 6 days of cover.) Red zone - stockout risk. Amber zone - stockout warning. Green zone - safe stock levels.',
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

export default BarChartOne;

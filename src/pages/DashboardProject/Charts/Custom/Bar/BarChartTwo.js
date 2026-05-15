import React from 'react';
import ReactApexChart from 'react-apexcharts';
import getChartColorsArray from '../../../../../Components/Common/ChartsDynamicColor';

const BarChartTwo = ({ dataColors }) => {
    var chartDatalabelsBarColors = getChartColorsArray(dataColors);
    const series = [{
        data: [45, 38, 32, 27, 21, 16, 12, 8, 5, 2]
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
            categories: ['Lisinopril 10mg', 'Atorvastatin 20mg', 'Amlodipine 5mg', 'Azithromycin 250mg', 'Doxycycline 100mg', 'Fluconazole 150mg', 'Salbutamol 100mcg', 'Prednisolone 5mg', 'Diclofenac 50mg', 'Cotrimoxazole 480mg'],
        },
        yaxis: {
            labels: {
                show: false
            }
        },
        title: {
            text: 'Bottom 10 Products Sold Today',
            align: 'left',
            floating: true,
            style: {
                fontWeight: 500,
            },
        },
        subtitle: {
            text: 'Units sold Today.',
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

export default BarChartTwo;

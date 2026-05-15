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
            categories: [
                'MedCare Westlands', 'Pharmaplus Ngong Rd', 'City Health Karen', 'HealthPlus Kilimani', 'Upperhill Pharmacy', 'Lavington Dispensary', 'Parklands Chemist', 'Hurlingham MedShop', 'South B Pharmacy', 'Eastleigh Health Ctr',
            ],
        },
        yaxis: {
            labels: {
                show: false
            }
        },
        title: {
            text: 'Top 10 Customers — Nairobi Branch',
            align: 'left',
            floating: true,
            style: {
                fontWeight: 500,
            },
        },
        subtitle: {
            text: 'Revenue Earned in Thousands(KES) - May.',
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

import React from 'react';
import ReactApexChart from 'react-apexcharts';
import getChartColorsArray from '../../../../../Components/Common/ChartsDynamicColor';

const LineChartOne = ({ dataColors }) => {
    var linechartBasicColors = getChartColorsArray(dataColors);
    const series = [{
        name: "MTD Sales (KES '000)",
        data: [
            142, 156, 133, 158, 123, 122, 144, 117, 108, 131, 124,
            null, null, null, null, null, null, null, null, null, null,
            null, null, null, null, null, null, null, null, null, null
        ]
    }];
    var options = {
        chart: {
            height: 350,
            type: 'line',
            zoom: {
                enabled: false
            },
            toolbar: {
                show: false
            }
        },
        markers: {
            size: 4,
        },
        dataLabels: {
            enabled: false
        },
        stroke: {
            curve: 'straight'
        },
        colors: linechartBasicColors,
        title: {
            text: 'MTD Sales - May 2026',
            align: 'left',
            style: {
                fontWeight: 500,
            },
        },
        xaxis: {
            categories: [
                '1','2','3','4','5','6','7','8','9','10','11',
                '12','13','14','15','16','17','18','19','20',
                '21','22','23','24','25','26','27','28','29','30','31'
            ],
            title: {
                text: 'Day of Month (May 2026)',
                style: { fontWeight: 400, fontSize: '12px' }
            },
            tooltip: { enabled: false }
        },
        yaxis: {
            title: {
                text: "KES '000",
                style: { fontWeight: 400, fontSize: '12px' }
            },
            labels: {
                formatter: (val) => val !== null ? val.toLocaleString() : ''
            }
        },
        tooltip: {
            y: {
                formatter: (val) => val !== null ? `KES ${val.toLocaleString()}K` : 'No data'
            }
        },
        annotations: {
            xaxis: [{
                x: '11',
                borderColor: '#999',
                borderWidth: 1,
                strokeDashArray: 4,
                label: {
                    text: 'Today',
                    style: { fontSize: '11px', fontWeight: 400 }
                }
            }]
        }
    };
    return (
        <React.Fragment>
            <ReactApexChart dir="ltr"
                options={options}
                series={series}
                type="line"
                height="350"
                className="apex-charts"
            />
        </React.Fragment>
    );
};

export { LineChartOne };
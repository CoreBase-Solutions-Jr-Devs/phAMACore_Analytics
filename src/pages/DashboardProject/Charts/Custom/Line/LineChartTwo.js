import React from 'react';
import ReactApexChart from 'react-apexcharts';
import getChartColorsArray from '../../../../../Components/Common/ChartsDynamicColor';

const LineChartTwo = ({ dataColors }) => {
    var linechartBasicColors = getChartColorsArray(dataColors);

    const series = [{
        name: "YTD Receivables (KES '000)",
        data: [
            3980, 8450, 1320, 19800, 21380, null, null, null, null, null, null, null 
        ]
    }];

    const options = {
        chart: {
            height: 350,
            type: 'line',
            zoom: { enabled: false },
            toolbar: { show: false }
        },
        markers: {
            size: 4,
        },
        dataLabels: {
            enabled: false
        },
        stroke: {
            curve: 'smooth'
        },
        colors: linechartBasicColors,
        title: {
            text: "YTD Receivables — 2026 (KES '000)",
            align: 'left',
            style: { fontWeight: 500 },
        },
        xaxis: {
            categories: [
                'Jan', 'Feb', 'Mar', 'Apr', 'May',
                'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
            ],
            title: {
                text: 'Month (2026)',
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
                x: 'May',
                borderColor: '#999',
                borderWidth: 1,
                strokeDashArray: 4,
                label: {
                    text: 'Current month',
                    style: { fontSize: '11px', fontWeight: 400 }
                }
            }]
        }
    };

    return (
        <React.Fragment>
            <ReactApexChart
                dir="ltr"
                options={options}
                series={series}
                type="line"
                height="350"
                className="apex-charts"
            />
        </React.Fragment>
    );
};

export { LineChartTwo };
import React from 'react';
import ReactApexChart from 'react-apexcharts';
import getChartColorsArray from '../../../../../Components/Common/ChartsDynamicColor';

const LineChartThree = ({ dataColors }) => {
    var linechartBasicColors = getChartColorsArray(dataColors);
    const series = [{
        name: "Desktops",
        data: [10, 41, 35, 51, 49, 62, 69, 91, 148]
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
            text: 'MTD vs YTD Sales',
            align: 'left',
            style: {
                fontWeight: 500,
            },
        },

        xaxis: {
            categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
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

export { LineChartThree };
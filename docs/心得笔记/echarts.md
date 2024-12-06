# 循环滚动的柱状图
```ts
let yAxisData = [
    'AA',
    'BB',
    'CC',
    'DD',
    'EE',
    'AAAA',
    'BBBB',
    'CCCC',
    'DDDD',
    'EEEE',
]
let seriesData = [200, 20, 100, 10, 10, 200, 20, 100, 10, 10]
let start = 0
let end = 4
const option = {
    xAxis: {
        type: 'value',
    },
    yAxis: {
        type: 'category',
        data: yAxisData,
        axisTick: {
            show: false,
        },
    },
    series: [
        {
            type: 'bar',
            data: seriesData,
            barWidth: '20px',
        },
    ],
    dataZoom: [
        {
            show: false, // 隐藏滚动控制器
            yAxisIndex: 0, // 适用于第一个 y 轴
            startValue: start , // 初始起始位置
            endValue:end, // 初始结束位置
        },
    ],
}

onMounted(() => {
    watch(
        () => props.option,
        () => {
            initEcharts()
        },
        {
            immediate: true,
        }
    )
})
onUnmounted(() => {
    echartsDom?.dispose()
})

function initEcharts() {
    if (!echartsRef.value) return
    echartsDom = echarts.init(echartsRef.value)
    echartsDom.setOption(option as any)

    clearInterval(setIntervalKey)
    setIntervalKey = setInterval(function () {
        yAxisData.push(yAxisData[start])
        seriesData.push(seriesData[start])
        start += 1
        end += 1

        if (start > 1000) {
            start = 0
            end = 4
            yAxisData = yAxisData.slice(0, 10)
            seriesData = seriesData.slice(0, 10)
        }

        echartsDom.setOption(
            {
                dataZoom: [
                    {
                        startValue: start,
                        endValue: end,
                    },
                ],
                yAxis: {
                    data: yAxisData,
                },
                series: [
                    {
                        data: seriesData,
                    },
                ],
            },
            false,
            true
        )
    }, 3 * 1000)
}
```

# 多柱图点击显示单个数据
https://www.cnblogs.com/sugartang/p/15331542.html
```js
myChart.getZr().off(); // 这个代码很重要，必须要加上，要不然的话你可以试试看
    myChart.getZr().on('click', params => {

      const actionObj = params.target
      console.log('actionObj', actionObj)
      const myKey = Object.keys(actionObj).sort().filter(_ => _.indexOf('ec_inner') !== -1)[0]
      console.log('myKey', myKey)
      const res = actionObj[myKey]
      console.log(`当前点击了第${res.dataIndex}组数据中的第${res.seriesIndex}个柱子`)
      var pointInPixel = [params.offsetX, params.offsetY];
      if (myChart.containPixel('grid', pointInPixel)) {
        /*此处添加具体执行代码*/
        var pointInGrid = myChart.convertFromPixel({ seriesIndex: 0 }, pointInPixel);
        //X轴序号
        var xIndex = pointInGrid[0];
        console.log('点击了横纵坐标', pointInPixel)
        console.log('【点击了第几组数据，纵坐标】', pointInGrid)
        //获取当前图表的option
        var op = myChart.getOption();
        console.log('数据信息', op)
        //获得图表中我们想要的数据---下面就不简写了，默认说我们的折现有2条吧
        var xValue = op.xAxis[0].data[xIndex];
        console.log('x轴所对应的名字', xValue)
        console.log('点击的这个柱子的名字', op.series[res.seriesIndex].name,'点击的这个柱子的值',op.series[res.seriesIndex].data[res.dataIndex])
      }
    });
```
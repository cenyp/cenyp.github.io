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
            startValue: 5, // 初始起始位置
            endValue: 9, // 初始结束位置
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
    const newOptions = Object.assign({}, option, props.option) as any
    echartsDom.setOption(newOptions)

    setInterval(function () {
        let yAxis = yAxisData.pop()
        let series = seriesData.pop()
        yAxisData.unshift(yAxis!)
        seriesData.unshift(series!)
        echartsDom.setOption(
            {
                yAxis: {
                    data: yAxisData,
                },
                series: [
                    {
                        data: seriesData,
                    },
                ],
            },
            false, // 设置合并模式
            true // 设置动画效果
        )
    }, 2 * 1000) // 每2秒滚动一次
}
```
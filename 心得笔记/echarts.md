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
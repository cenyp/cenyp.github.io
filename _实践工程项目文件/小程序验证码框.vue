<!-- todo uview 有现成的 -->
<template>
  <view class="verify-code">
    <view class="title"> 输入短信验证码 </view>
    <view class="tips">
      短信验证码已发至 <text>{{ tel }}</text>
    </view>

    <!-- todo 补充一键复制功能 -->
    <view class="verify-code-input">
      <view v-for="(item, i) in code" :key="i" class="item" @click="clickItem">
        <view
          v-if="!item && inputFocus && activeIndex === i"
          class="item-cursor"
        />
        <text v-else>{{ item }}</text>
      </view>
      <input
        v-if="activeIndex < code?.length"
        v-model="inputValue"
        type="number"
        inputmode="numeric"
        class="code-input"
        :focus="inputFocus"
        @blur="inputFocus = false"
        @input.stop="inputFinish"
      />
    </view>

    <view class="countdown">
      <text v-if="countdown > 0">{{ countdown }}秒后重新发送</text>
      <text v-else class="resend" @click="sendCode">重新发送</text>
    </view>
  </view>
</template>

<script lang="ts" setup>
// =======  依赖引入  =======
import { ref, nextTick } from "vue";

// =======  类型声明  =======

// =======  变量声明  =======
const tel = ref("");
const code = ref(["", "", "", ""]);
const inputFocus = ref(true);
const inputValue = ref("");
const activeIndex = ref(0);
const countdown = ref(120);
const countdownTimer = ref();

// =======  主流程  =======
sendCode();

// =======  函数声明  =======
function sendCode() {
  code.value = ["", "", "", ""];
  handleCountDown();
}
function handleCountDown() {
  countdown.value = 120;
  countdownTimer.value = setInterval(() => {
    countdown.value--;
    if (countdown.value === 0) {
      clearInterval(countdownTimer.value);
    }
  }, 1000);
}
function clickItem() {
  inputFocus.value = true;
  const i = code.value.findIndex((item) => !item);
  // 最后一位
  if (i === -1) {
    inputValue.value = "";
    code.value[code.value?.length - 1] = "";
    nextTick(() => {
      activeIndex.value = code.value?.length - 1;
    });
  } else {
    activeIndex.value = i;
  }
}
function inputFinish(e: any) {
  nextTick(() => {
    inputValue.value = "";
  });
  const { keyCode } = e.detail;

  // 删除
  if (keyCode === 8 && inputValue.value === "") {
    code.value[activeIndex.value - 1] = "";

    // 下标回退
    if (activeIndex.value > 0) {
      activeIndex.value--;
    }
    return;
  }

  // 兼容复制
  const inputVal = inputValue.value?.replace(/\D/g, "");
  const data =
    inputVal?.length > 1
      ? inputVal?.slice(0, code.value?.length - activeIndex.value)
      : inputVal;

  if (data?.length > 0) {
    data.split("").forEach((item) => {
      code.value[activeIndex.value] = item;
      activeIndex.value++;
    });

    // 满位
    if (activeIndex.value === code.value.length) {
      // 登录
      code.value = ["", "", "", ""];
      activeIndex.value = 0;
    }
  } else {
    code.value[activeIndex.value] = "";
  }
}

// =======  属性返回  =======
</script>

<style lang="scss" scoped>
@keyframes focus {
  0% {
    opacity: 1;
  }

  80%,
  100% {
    opacity: 0;
  }
}
.verify-code {
  box-sizing: border-box;
  min-height: 100vh;
  padding: 55px 30px;

  .title {
    margin-bottom: 8px;
    font-family: PingFangSC, PingFang SC;
    font-size: 24px;
    line-height: 34px;
    font-weight: 500;
    font-style: normal;
    text-align: left;
    color: #1c1c1e;
  }

  .tips {
    margin-bottom: 35px;
    font-family: PingFangSC, PingFang SC;
    font-size: 15px;
    line-height: 21px;
    font-weight: 400;
    font-style: normal;
    text-align: left;
    color: #8e8e93;
  }

  .verify-code-input {
    display: flex;
    align-items: center;
    position: relative;

    .item {
      width: 60px;
      height: 60px;
      margin-left: 25px;
      border-radius: 6px;
      background: #f2f2f7;
      font-size: 30px;
      line-height: 60px;
      font-weight: 500;
      text-align: center;
      color: #3a3a3c;
      &:first-child {
        margin-left: 0;
      }
    }

    .item-cursor {
      width: 1px;
      height: 30px;
      margin-top: 15px;
      margin-left: 29px;
      background-color: #3a3a3c;
      animation: focus 1.2s infinite;
    }

    .code-input {
      box-sizing: border-box;
      position: absolute;
      top: 0;
      z-index: 3;
      width: 0;
      height: 0;
      font-size: 30px;
      line-height: 60px;
      font-weight: 500;
      color: #3a3a3c;
    }
  }

  .countdown {
    margin-top: 20px;
    font-family: PingFangSC, PingFang SC;
    font-size: 15px;
    line-height: 21px;
    font-weight: 400;
    font-style: normal;
    text-align: left;
    color: #8e8e93;

    .resend {
      color: #5395e4;
    }
  }
}
</style>

<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <h1>欢迎登录</h1>
      </div>

      <div class="login-body">
        <a-tabs 
          :activeKey="customActiveKey" 
          :tab-bar-style="{ textAlign: 'center', borderBottom: 'unset' }"
          @change="handleTabClick"
        >
          <a-tab-pane key="tab1" tab="账号密码登录">
            <login-account 
              ref="alogin" 
              @validateFail="validateFail"
              @success="requestSuccess"
              @fail="requestFailed"
            />
          </a-tab-pane>

          <a-tab-pane key="tab2" tab="手机号登录">
            <login-phone
              ref="plogin"
              @validateFail="validateFail"
              @success="requestSuccess"
              @fail="requestFailed"
            />
          </a-tab-pane>
        </a-tabs>

        <a-form-model-item>
          <a-checkbox :checked="rememberMe" @change="handleRememberMeChange">
            自动登录
          </a-checkbox>
        </a-form-model-item>

        <a-form-model-item>
          <a-button 
            type="primary" 
            size="large" 
            class="login-button" 
            :loading="loginBtn"
            @click="handleSubmit"
            block
          >
            登录
          </a-button>
        </a-form-model-item>

        <div class="login-footer">
          <a @click="handleForgetPassword">忘记密码</a>
          <a-divider type="vertical" />
          <a @click="handleRegister">注册账户</a>
        </div>

        <!-- 第三方登录 -->
        <third-login />

        <!-- 选择租户 -->
        <login-select-tenant ref="loginSelect" @success="loginSelectOk" />

        <!-- 两步验证 -->
        <two-step-captcha
          v-if="requiredTwoStepCaptcha"
          :visible="stepCaptchaVisible"
          @success="stepCaptchaSuccess"
          @cancel="stepCaptchaCancel"
        />
      </div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import { ACCESS_TOKEN, ENCRYPTED_STRING } from '@/store/mutation-types'
import ThirdLogin from './third/ThirdLogin'
import LoginSelectTenant from './LoginSelectTenant'
import TwoStepCaptcha from '@/components/tools/TwoStepCaptcha'
import { getEncryptedString } from '@/utils/encryption/aesEncrypt'
import { timeFix } from '@/utils/util'

import LoginAccount from './LoginAccount'
import LoginPhone from './LoginPhone'

export default {
  components: {
    LoginSelectTenant,
    TwoStepCaptcha,
    ThirdLogin,
    LoginAccount,
    LoginPhone
  },
  data () {
    return {
      customActiveKey: 'tab1',
      rememberMe: true,
      loginBtn: false,
      requiredTwoStepCaptcha: false,
      stepCaptchaVisible: false,
      encryptedString:{
        key:"",
        iv:"",
      },
    }
  },
  created() {
    Vue.ls.remove(ACCESS_TOKEN)
    this.getRouterData();
    this.rememberMe = true
    this.getEncrypte()
  },
  methods:{
    handleTabClick(key){
      this.customActiveKey = key
    },
    handleRememberMeChange(e){
      this.rememberMe = e.target.checked
    },
    /**跳转到登录页面的参数-账号获取*/
    getRouterData(){
      this.$nextTick(() => {
        let temp = this.$route.params.username || this.$route.query.username || ''
        if (temp) {
          this.$refs.alogin.acceptUsername(temp)
        }
      })
    },

    //登录
    handleSubmit () {
      this.loginBtn = true;
      if (this.customActiveKey === 'tab1') {
        // 使用账户密码登录
        this.$refs.alogin.handleLogin(this.rememberMe)
      } else {
        //手机号码登录
        this.$refs.plogin.handleLogin(this.rememberMe)
      }
    },
    // 校验失败
    validateFail(){
      this.loginBtn = false;
    },
    // 登录后台成功
    requestSuccess(loginResult){
      this.$refs.loginSelect.show(loginResult)
    },
    //登录后台失败
    requestFailed (err) {
      let description = ((err.response || {}).data || {}).message || err.message || "请求出现错误，请稍后再试"
      this.$notification[ 'error' ]({
        message: '登录失败',
        description: description,
        duration: 4,
      });
      //账户密码登录错误后更新验证码
      if(this.customActiveKey === 'tab1' && description.indexOf('密码错误')>0){
        this.$refs.alogin.handleChangeCheckCode()
      }
      this.loginBtn = false;
    },
    loginSelectOk(){
      this.loginSuccess()
    },
    //登录成功
    loginSuccess () {
      this.$router.push({ path: "/dashboard/analysis" }).catch(()=>{
        console.log('登录跳转首页出错,这个错误从哪里来的')
      })
      this.$notification.success({
        message: '欢迎',
        description: `${timeFix()}，欢迎回来`,
      });
    },
    handleForgetPassword() {
      this.$message.info('忘记密码功能开发中...')
    },
    handleRegister() {
      this.$message.info('注册功能开发中...')
    },

    stepCaptchaSuccess () {
      this.loginSuccess()
    },
    stepCaptchaCancel () {
      this.$store.dispatch('Logout').then(() => {
        this.loginBtn = false
        this.stepCaptchaVisible = false
      })
    },
    //获取密码加密规则
    getEncrypte(){
      var encryptedString = Vue.ls.get(ENCRYPTED_STRING);
      if(encryptedString == null){
        getEncryptedString().then((data) => {
          this.encryptedString = data
        });
      }else{
        this.encryptedString = encryptedString;
      }
    }

  }
}
</script>

<style scoped>
.login-container {
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.login-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 15px 35px #a4baed;
  overflow: hidden;
  transition: all 0.3s ease;
  width: 100%;
  max-width: 450px;
}

.login-card:hover {
  box-shadow: 0 20px 40px #a4baed;
  transform: translateY(-5px);
}

.login-header {
  text-align: center;
  padding: 30px 0 20px;
  background: linear-gradient(to right, #a4baed, #a4baed);
  color: white;
}

.login-header h1 {
  font-size: 28px;
  font-weight: 600;
  letter-spacing: 1px;
  margin-bottom: 8px;
}

.login-header p {
  margin-top: 8px;
  opacity: 0.9;
  font-size: 16px;
}

.login-body {
  padding: 30px;
}

.captcha-img {
  width: 100%;
  height: 44px;
  border-radius: 6px;
  border: 1px solid #d9d9d9;
  cursor: pointer;
  transition: all 0.3s;
}

.captcha-img:hover {
  border-color: #4776E6;
  box-shadow: 0 0 0 2px rgba(71, 118, 230, 0.2);
}

.login-button {
  width: 100%;
  height: 50px;
  background: linear-gradient(to right, #a4baed, #a4baed);
  color: white;
  font-size: 16px;
  font-weight: 600;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(71, 118, 230, 0.4);
}

.login-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 7px 20px rgba(71, 118, 230, 0.6);
}

.login-button:active {
  transform: translateY(0);
}

.login-footer {
  text-align: center;
  margin-top: 25px;
  color: #7a7f8c;
  font-size: 14px;
}

.login-footer a {
  color: #4776E6;
  text-decoration: none;
  font-weight: 500;
  margin: 0 10px;
  transition: color 0.3s;
}

.login-footer a:hover {
  color: #8E54E9;
  text-decoration: underline;
}

@media (max-width: 480px) {
  .login-card {
    margin: 0 20px;
  }
  
  .login-body {
    padding: 20px;
  }
  
  .login-header {
    padding: 25px 0 15px;
  }
  
  .login-header h1 {
    font-size: 24px;
  }
}
</style>
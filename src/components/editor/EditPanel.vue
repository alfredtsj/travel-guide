<template>
  <div class="edit-panel-content space-y-4">
    <!-- 基础行程信息 -->
    <div v-if="editor.sectionVisibility.basic" class="card">
      <div class="section-title">
        <span>📍</span> 基础行程
        <button class="ml-auto text-xs text-[#999] hover:text-[#e8734a]" @click="editor.sectionVisibility.basic = false">隐藏</button>
      </div>
      <div class="space-y-3">
        <div>
          <label class="label">目的地</label>
          <input class="input" v-model="editor.guideData.destination" placeholder="如：云南大理" @input="editor.autoSave" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="label">出行天数</label>
            <input class="input" v-model="editor.guideData.days" placeholder="如：5天4晚" />
          </div>
          <div>
            <label class="label">出行日期</label>
            <input class="input" type="date" v-model="editor.guideData.date" />
          </div>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="label">出行人数</label>
            <input class="input" v-model="editor.guideData.people" placeholder="如：2人" />
          </div>
          <div>
            <label class="label">旅行主题</label>
            <select class="input" v-model="editor.guideData.theme">
              <option value="">选择主题</option>
              <option value="亲子">亲子</option>
              <option value="徒步">徒步</option>
              <option value="美食">美食</option>
              <option value="小众">小众</option>
              <option value="自驾">自驾</option>
              <option value="摄影">摄影</option>
              <option value="蜜月">蜜月</option>
              <option value="闺蜜">闺蜜</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- 交通攻略 -->
    <div v-if="editor.sectionVisibility.transport" class="card">
      <div class="section-title">
        <span>🚗</span> 交通攻略
        <button class="ml-auto text-xs text-[#999] hover:text-[#e8734a]" @click="editor.sectionVisibility.transport = false">隐藏</button>
      </div>
      <div class="space-y-3">
        <div>
          <label class="label">往返交通</label>
          <textarea class="textarea" rows="2" v-model="editor.guideData.transport" placeholder="如：深圳→大理 高铁6小时 ¥580"></textarea>
        </div>
        <div>
          <label class="label">当地交通</label>
          <textarea class="textarea" rows="2" v-model="editor.guideData.localTransport" placeholder="如：租电瓶车 ¥50/天 或 滴滴打车"></textarea>
        </div>
        <div>
          <label class="label">交通贴士</label>
          <textarea class="textarea" rows="2" v-model="editor.guideData.transportTips" placeholder="如：古城内只能步行，建议穿舒适的鞋"></textarea>
        </div>
        <div>
          <label class="label">交通费用预估</label>
          <input class="input" v-model="editor.guideData.transportCost" placeholder="如：约¥800/人" />
        </div>
      </div>
    </div>

    <!-- 住宿攻略 -->
    <div v-if="editor.sectionVisibility.accommodation" class="card">
      <div class="section-title">
        <span>🏨</span> 住宿攻略
        <button class="ml-auto text-xs text-[#999] hover:text-[#e8734a]" @click="editor.sectionVisibility.accommodation = false">隐藏</button>
      </div>
      <div class="space-y-3">
        <div>
          <label class="label">推荐住宿区域</label>
          <input class="input" v-model="editor.guideData.accommodation" placeholder="如：大理古城内 / 洱海边才村" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="label">酒店/民宿名称</label>
            <input class="input" v-model="editor.guideData.hotelName" placeholder="如：洱海醒来客栈" />
          </div>
          <div>
            <label class="label">住宿价格</label>
            <input class="input" v-model="editor.guideData.hotelPrice" placeholder="如：¥300-500/晚" />
          </div>
        </div>
        <div>
          <label class="label">入住体验</label>
          <textarea class="textarea" rows="2" v-model="editor.guideData.hotelExp" placeholder="如：海景大窗、老板人很好、早餐丰盛"></textarea>
        </div>
        <div>
          <label class="label">住宿小贴士</label>
          <textarea class="textarea" rows="2" v-model="editor.guideData.hotelTips" placeholder="如：提前2周预定有优惠，避开节假日"></textarea>
        </div>
      </div>
    </div>

    <!-- 行前准备 -->
    <div v-if="editor.sectionVisibility.preparation" class="card">
      <div class="section-title">
        <span>🎒</span> 行前准备
        <button class="ml-auto text-xs text-[#999] hover:text-[#e8734a]" @click="editor.sectionVisibility.preparation = false">隐藏</button>
      </div>
      <div class="space-y-3">
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="label">必备物品</label>
            <textarea class="textarea" rows="2" v-model="editor.guideData.essentials" placeholder="如：相机、充电宝、防晒"></textarea>
          </div>
          <div>
            <label class="label">证件资料</label>
            <textarea class="textarea" rows="2" v-model="editor.guideData.documents" placeholder="如：身份证、学生证"></textarea>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="label">穿搭建议</label>
            <textarea class="textarea" rows="2" v-model="editor.guideData.clothing" placeholder="如：薄外套、长裙、舒适鞋"></textarea>
          </div>
          <div>
            <label class="label">防晒/防雨</label>
            <textarea class="textarea" rows="2" v-model="editor.guideData.weatherPrep" placeholder="如：防晒霜SPF50+、雨伞"></textarea>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="label">药品准备</label>
            <textarea class="textarea" rows="2" v-model="editor.guideData.medicine" placeholder="如：感冒药、肠胃药、创可贴"></textarea>
          </div>
          <div>
            <label class="label">流量网络</label>
            <textarea class="textarea" rows="2" v-model="editor.guideData.network" placeholder="如：支付宝境外流量包"></textarea>
          </div>
        </div>
      </div>
    </div>

    <!-- 每日行程安排 -->
    <div v-if="editor.sectionVisibility.itinerary" class="card">
      <div class="section-title">
        <span>📅</span> 每日行程
        <button class="ml-auto text-xs text-[#999] hover:text-[#e8734a]" @click="editor.sectionVisibility.itinerary = false">隐藏</button>
      </div>
      <div class="space-y-3">
        <div v-for="(day, idx) in editor.guideData.itinerary" :key="idx" class="p-3 bg-[#faf9f6] rounded-xl border border-[#eae5df]">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-bold text-[#e8734a]">Day {{ idx + 1 }}</span>
            <button class="text-[#ccc] hover:text-red-400 text-sm" @click="editor.guideData.itinerary.splice(idx, 1); editor.autoSave()">✕</button>
          </div>
          <div class="space-y-2">
            <div>
              <label class="label text-xs">景点安排</label>
              <textarea class="textarea text-sm" rows="2" v-model="day.spots" placeholder="如：上午：洱海骑行 → 中午：喜洲古镇 → 下午：双廊"></textarea>
            </div>
            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="label text-xs">游玩时长</label>
                <input class="input text-sm" v-model="day.duration" placeholder="如：全天" />
              </div>
              <div>
                <label class="label text-xs">路线规划</label>
                <input class="input text-sm" v-model="day.route" placeholder="如：顺时针环海" />
              </div>
            </div>
          </div>
        </div>
        <button class="btn-ghost w-full text-sm py-2" @click="editor.guideData.itinerary.push({ day: editor.guideData.itinerary.length + 1, spots: '', duration: '', route: '' }); editor.autoSave()">
          + 添加一天行程
        </button>
      </div>
    </div>

    <!-- 美食攻略 -->
    <div v-if="editor.sectionVisibility.food" class="card">
      <div class="section-title">
        <span>🍜</span> 美食攻略
        <button class="ml-auto text-xs text-[#999] hover:text-[#e8734a]" @click="editor.sectionVisibility.food = false">隐藏</button>
      </div>
      <div class="space-y-3">
        <div>
          <label class="label">必吃美食</label>
          <textarea class="textarea" rows="2" v-model="editor.guideData.food" placeholder="如：过桥米线、烤乳扇、汽锅鸡"></textarea>
        </div>
        <div>
          <label class="label">探店推荐</label>
          <textarea class="textarea" rows="2" v-model="editor.guideData.foodShops" placeholder="如：再回首凉鸡米线（古城人民路）"></textarea>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="label">人均消费</label>
            <input class="input" v-model="editor.guideData.foodPrice" placeholder="如：¥50-80/人" />
          </div>
          <div>
            <label class="label">口味点评</label>
            <textarea class="textarea" rows="2" v-model="editor.guideData.foodReview" placeholder="如：酸辣适中、分量足"></textarea>
          </div>
        </div>
        <div>
          <label class="label">避雷店铺</label>
          <textarea class="textarea" rows="2" v-model="editor.guideData.foodAvoid" placeholder="如：景区附近某网红店性价比低"></textarea>
        </div>
      </div>
    </div>

    <!-- 游玩贴士/避坑 -->
    <div v-if="editor.sectionVisibility.tips" class="card">
      <div class="section-title">
        <span>⚠️</span> 避坑指南
        <button class="ml-auto text-xs text-[#999] hover:text-[#e8734a]" @click="editor.sectionVisibility.tips = false">隐藏</button>
      </div>
      <div class="space-y-3">
        <div>
          <label class="label">景区避坑</label>
          <textarea class="textarea" rows="2" v-model="editor.guideData.tipsScenic" placeholder="如：不要买景点门口的银器"></textarea>
        </div>
        <div>
          <label class="label">消费避雷</label>
          <textarea class="textarea" rows="2" v-model="editor.guideData.tipsConsume" placeholder="如：出租车不打表可以拒乘"></textarea>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="label">预约须知</label>
            <textarea class="textarea" rows="2" v-model="editor.guideData.tipsBooking" placeholder="如：热门景点需提前1天预约"></textarea>
          </div>
          <div>
            <label class="label">营业时间</label>
            <textarea class="textarea" rows="2" v-model="editor.guideData.tipsHours" placeholder="如：古城店铺一般9:00-22:00"></textarea>
          </div>
        </div>
      </div>
    </div>

    <!-- 隐藏板块的快捷入口 -->
    <div class="card">
      <div class="text-sm text-[#999] mb-2">已隐藏的板块：</div>
      <div class="flex flex-wrap gap-2">
        <button v-if="!editor.sectionVisibility.basic" class="btn-ghost text-xs px-3 py-1" @click="editor.sectionVisibility.basic = true">+ 基础行程</button>
        <button v-if="!editor.sectionVisibility.transport" class="btn-ghost text-xs px-3 py-1" @click="editor.sectionVisibility.transport = true">+ 交通攻略</button>
        <button v-if="!editor.sectionVisibility.accommodation" class="btn-ghost text-xs px-3 py-1" @click="editor.sectionVisibility.accommodation = true">+ 住宿攻略</button>
        <button v-if="!editor.sectionVisibility.preparation" class="btn-ghost text-xs px-3 py-1" @click="editor.sectionVisibility.preparation = true">+ 行前准备</button>
        <button v-if="!editor.sectionVisibility.itinerary" class="btn-ghost text-xs px-3 py-1" @click="editor.sectionVisibility.itinerary = true">+ 每日行程</button>
        <button v-if="!editor.sectionVisibility.food" class="btn-ghost text-xs px-3 py-1" @click="editor.sectionVisibility.food = true">+ 美食攻略</button>
        <button v-if="!editor.sectionVisibility.tips" class="btn-ghost text-xs px-3 py-1" @click="editor.sectionVisibility.tips = true">+ 避坑指南</button>
      </div>
    </div>

    <!-- 自定义备注 -->
    <div class="card">
      <div class="section-title">
        <span>💬</span> 自定义备注
      </div>
      <div>
        <textarea class="textarea" rows="3" v-model="editor.guideData.customNotes" placeholder="自由输入任何补充内容..."></textarea>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useEditorStore } from '@/stores/editor'

const editor = useEditorStore()

// 暴露给父组件调用
defineExpose({})
</script>

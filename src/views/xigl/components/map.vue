<template>
    <div class="geom" ref="geom">
      <div id="map"></div>
      <dragBoxVue v-show="resultShow" @closeFn="resultShow = false" :isDrag="true" :initX="'400px'" initWidth="550px"
        initHeight="400px" :initY="'0'" :boxName="'查询'" :maxData="{
          minWidth: '500px',
          maxWidth: '80vw',
          minHeight: '400px',
          maxHeight: '80vh',
        }">
      </dragBoxVue>
      <!-- 右侧图层树 -->
      <div class="left-box" :style="{ left: leftShow ? '0' : '-360px' }">
        <div class="head_fun">
          <span style="position: absolute; 
          left: 40px;
          top: 20px;
          color: rgba(96, 160, 241, 1);
          font-size: 18px;
          font-weight: 700;">1.选择数据图库</span>
          <i class="tool_hd" @click="leftShow = !leftShow"
            :class="leftShow == true ? 'fa fa-outdent' : 'fa fa-indent'"></i>
        </div>
        <div class="left_content">
          <div style="margin-bottom: 15px">
            <img :src="'../images/dtree/4.png'" style="width: 16px;position: absolute;left: 30px;top: 70px;" />
            <input type="text" v-model="filterText"
              style="width: 85%; height: 35px; margin-left: 10px;padding-left: 40px;" class="el-input__inner">
            </input>
            <span
              style="margin-left: 5px;background-color: #60A0F1;height: 36px;position: absolute;padding: 8px;border-radius: 8px;">
              <svg-icon icon-class="sjzx_搜索放大镜" style="width: 18px;height: 18px;" />
            </span>
          </div>
          <div class="tree-list" style="">
            <el-tree class="modal-tree" :data="layerList" node-key="id" ref="trees" :props="defaultProps"
              :filter-node-method="filterNode">
              <div class="custom-tree-node" slot-scope="{ data }">
                <span v-if="data.children != null" class="folder">
                  <img :src="'../images/dtree/2.png'" style="margin-bottom: 5px; width: 16px; font-size: 16px" />
                  <span style="color: #000; font-size: 18px">
                    {{ data.name }} ({{ data.serviceCount }})
                  </span>
                </span>
                <div class="layerli" v-if="data.children == null">
                  <div>
                    <img class="layer_img" :src="'../images/dtree/1.png'" />
                  </div>
                  <div class="layer_item">
                    <el-tooltip class="item" effect="dark" :content="data.name" placement="top">
                      <p class="layer_name">{{ data.name }}</p>
                    </el-tooltip>
                  </div>
                  <div class="add-icon">
                    <span>
                      <img @click="addLayer(data)" style="width: 16px" :src="'../images/dtree/3.png'" />
                    </span>
                  </div>
                </div>
              </div>
            </el-tree>
          </div>
        </div>
      </div>
      <!-- <div class="middle-box " v-for="item in leftData" :key="item.id" v-show="item.showTable"
        :class="{ 'resizing': resizingItemId === item.id }" v-drag="{ group: 'tables', animation: 300 }"
        :drag-disabled="isResizing" @dragstart="onDragStart(index)" @dragend="onDragEnd"
        @mousedown="onResizeStart($event)">
        <div class="table-header">
          <span>{{ item.title || '企业数据表格 (注：展示表格前50条数据)' }}</span>
          <el-button class="table-button" @click.stop.prevent="toggleTable(item.id)">
            {{ 'X' }}
          </el-button> 
        </div> -->
        <div class="middle-box " v-for="item in leftData" :key="item.id" v-show="item.showTable"
        :class="{ 'resizing': resizingItemId === item.id }" @mousedown="onResizeStart($event)">
        <div class="table-header">
          <span>{{ item.title || '企业数据表格 (注：展示表格前50条数据)' }}</span>
          <!-- <el-button class="table-button" @click.stop.prevent="toggleTable(item.id)">
            {{ 'X' }}
          </el-button> -->
        </div>
        <div class="table-box">
          <el-table :data="item.excelData" border style="width: 100%">
            <el-table-column v-for="col in item.excelColumns" :key="col.prop" :prop="col.prop" :label="col.label">
            </el-table-column>
          </el-table>
        </div>
      </div>
      <div class="right-box" :style="{ right: rightShow ? '20' : '-360px' }">
        <div class="head_fun">
          <p class="tool_p">
            <span style="position: absolute; left: 15px;font-size: 16px;"> 2.确认已选数据</span>
            <el-button
              style="position: absolute;right: 20px;line-height: 10px;margin-top: 5px;background-color: rgba(171,171,171,1);color: rgba(255,255,255,1)"
              @click="delAdd()">清空</el-button>
          </p>
        </div>
        <div class="right_content">
          <div class="fwx_layers">
            <li class="layer largeSize" :id="'layer_' + item.id" v-for="(item, i) in leftData" :key="i">
              <div class="first-line">
                <div class="layer-icon">
                  <el-checkbox-button style="background: none" v-model="layerData[item.id]"
                    @change="showLayers($event, item)" class="custom-checkbox">
                    <i :class="layerData[item.id] ? 'fa fa-eye' : 'fa fa-eye-slash'"></i>
                  </el-checkbox-button>
                </div>
                <el-tooltip class="item" effect="dark" :content="item.name" placement="top">
                  <span class="layertitle"><span>{{ item.name }}</span></span>
                </el-tooltip>
              </div>
              <div class="secound-line">
                <!-- 1. 普通图层（非表格数据且非其他类型） -->
                <template v-if="item.service && item.service.type !== 'nonService' && item.userType !== 'other'">
                  <span @click="setView(item.id)"
                    :class="['fa fa-arrows-alt', { 'active-text': viewActiveId === item.id }]">全屏</span>
                  <span @click="showOpacity(item.id)"
                    :class="['fa fa-arrows-h', { 'active-text': opacityActiveId === item.id }]">透明度</span>
                  <span @click="removeLayer(item.id)" class="fa fa-trash-o">删除</span>
                </template>
  
                <!-- 2. 表格数据 -->
                <template v-else-if="item.userType === 'tableData'">
                  <span @click="showTable(item.id)" :class="['fa fa-table', { 'active-text': item.showTable }]">属性表</span>
                  <span @click="removeLayer(item.id)" class="fa fa-trash-o">删除</span>
                </template>
  
                <!-- 3. 其他类型（仅显示删除按钮） -->
                <template v-else>
                  <span @click="removeLayer(item.id)" class="fa fa-trash-o">删除</span>
                </template>
              </div>
              <el-slider :id="item.id + 'slider'" @change="setOpacity(item.opacity, item)" v-model="item.opacity"
                class="slider"></el-slider>
            </li>
          </div>
          <div class="btn_ztt">
            <span style="font-size: 16px;padding: 10px;color: rgba(96, 160, 241, 1);">
              3.自定义范围
            </span>
            <div class="add_ztt" @click="drawPoly()"><span>自定义范围</span></div>
          </div>
          <!-- 新增的上传卡片 -->
          <div class="upload-card">
            <div class="upload-header">
              <div class="upload-left">
                <i class="fa fa-upload"></i>
                <span>本地上传</span>
              </div>
              <el-button type="primary" class="browse-btn" @click="zxztFlag = true">
                浏览
              </el-button>
            </div>
          </div>
  
          <!-- 新增的列表卡片 -->
          <div class="list-card">
            <div class="list-content">
              <div class="list-item" v-for="fwx in addFwxLayerList" :key="fwx.id">
                <div class="item-left">
                  <img :src="'../images/6.png'" class="item-icon" style="width: 10px;height: 10px;" />
                  <span class="item-name">{{ fwx.name }}</span>
                </div>
                <span @click="removeLayer(fwx.id)" class="fa fa-trash-o remove-icon"></span>
              </div>
            </div>
          </div>
          <div class="select-section">
            <div class="title">默认范围</div>
            <el-select v-model="selectedRange" placeholder="请选择范围" @change="handleRangeChange">
              <el-option v-for="item in rangeOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </div>
          <div class="btn_ztt">
            <div class="add_ztt" style="width: 100%;text-align: center;margin: 0;" @click="apply">
              <span>4.申请下载(范围内得已选数据)</span>
            </div>
          </div>
        </div>
      </div>
  
      <div class="jzhcdragUploadBox" v-show="zxztFlag">
        <div class="jzhctitleBox">
          <div>导入本地数据</div>
          <img :src="'../images/4.png'" style="width: 30px;cursor: pointer;" @click="zxztFlag = false" />
        </div>
        <div id="jzhcdropZone">
          <div class="jzhcdropZoneTitle">
            <input type="file" @change="tirggerFile" accept=".zip" v-show="false" ref="jzhcinputDom" />
            <img :src="'../images/5.png'" style="width: 72px;" class="upload-icon" />
            <div class="upload-text">
              <span @click="uploadsingleFile" v-show="!fileUpload">点击选择或拖拽导入文件</span>
              <span v-show="fileUpload">{{ fileUpload }}</span>
            </div>
          </div>
          <div class="jzhcdropZoneinfo" v-show="!fileUpload">请上传zip文件</div>
        </div>
        <div class="jzhcbtnBox">
          <el-button @click="zxztFlag = false">取消</el-button>
          <el-button type="primary" @click="uploadFile">导入</el-button>
        </div>
      </div>
      <analysVue class="analysVue" :linkArr="linkArr" :hideAnalysis="true" @getGeojson="getGeojson" />
    </div>
  </template>
  
  <script>
  // 引入必要的 OpenLayers 模块
  import { transformExtent } from 'ol/proj';
  import { get } from 'ol/proj';
  import { initOpenLayer, OpenLayerTool } from '@/views/workStation/openlayer'
  import analysVue from '@/views/workStation/analys.vue'
  import dragBoxVue from '@/views/workStation/dragBox.vue'
  import uuid from '@/utils/uuid'
  import * as control from 'ol/control'
  import Map from 'ol/Map'
  import View from 'ol/View'
  import TileLayer from 'ol/layer/Tile'
  import TileWMS from 'ol/source/TileWMS'
  import ImageLayer from 'ol/layer/Image'
  import ImageWMS from 'ol/source/ImageWMS'
  import { register } from 'ol/proj/proj4'
  import { transform, get as getProjection } from 'ol/proj'
  import WMTS, { optionsFromCapabilities } from 'ol/source/WMTS'
  import WMTSCapabilities from 'ol/format/WMTSCapabilities'
  import VectorLayer from 'ol/layer/Vector'
  import VectorSource from 'ol/source/Vector'
  import GeoJSON from 'ol/format/GeoJSON'
  import { Stroke, Fill, Style, Circle as CircleStyle } from 'ol/style'
  import * as turf from '@turf/turf'
  import WMTSTileGrid from 'ol/tilegrid/WMTS'
  import { shpToGeojson, getLayerDataList1, previewTableByName } from '@/api/zcmh/zcsq'
  import { addToCarts, getServiceListByTreeId } from '@/api/zcmh/index.js'
  import geojsonData from '../data/geo.json'
  export default {
    components: {
      analysVue,
      dragBoxVue,
    },
    data() {
      return {
        resizingItemId: null,
        dragIndex: -1,
        isResizing: false, // 用来控制是否禁止拖拽
        resizeStartX: 0,
        resizeStartY: 0,
        resizeStartWidth: 0,
        resizeStartHeight: 0,
        resizingElement: null,
        opacityActiveId: '',
        viewActiveId: '',
        selectedRange: null,
        rangeOptions: [
          { label: '天河区', value: '天河区' },
          { label: '越秀区', value: '越秀区' },
          { label: '白云区', value: '白云区' },
          { label: '海珠区', value: '海珠区' },
          { label: '番禺区', value: '番禺区' },
          { label: '荔湾区', value: '荔湾区' },
          { label: '黄埔区', value: '黄埔区' },
          { label: '增城区', value: '增城区' },
          { label: '花都区', value: '花都区' },
          { label: '从化区', value: '从化区' },
          { label: '南沙区', value: '南沙区' },
        ],
        excelId: '',
        tableShow: false,
        layerData: {}, //控制图层开关
        resultShow: false,
        linkArr: [],
        map: null,
        leftShow: true,
        rightShow: true,
        layerList: [],
        defaultProps: {
          children: 'children',
          label: 'name',
        },
        filterText: '',
        leftData: [],
        addFwxLayerList: [],
        total: '',
        zxztFlag: false,
        fileUpload: false,
        fileData: null,
        uploadLayer: null,
        geoData: null,
        styleConfigDefault: {
          //输出结果样式
          radius: 3,
          weight: 3,
          color: '#ff0000',
          fillColor: '#ff0000',
          opacity: 0,
          fillOpacity: 0.5,
        },
      }
    },
    watch: {
      filterText(val) {
        this.$refs.trees.filter(val)
      },
    },
    methods: {
      handleRangeChange(val) {
        this.geoData = {
          [val]: val,
          source: 'default',
        }
        const mapGeoData = geojsonData
        const rangeData = mapGeoData[val]
        let jsonStr = JSON.stringify(rangeData)
        this.addFwx(val, jsonStr)
        console.log(mapGeoData, 'mapGeoData')
        console.log(rangeData, 'rangeData')
        console.log('选中范围值:', val)
      },
      showTable(id) {
        const current = this.leftData.find((item) => item.id === id)
        if (!current) return
  
        if (current.showTable) {
          // 当前已打开，关闭
          current.showTable = false
          this.excelId = null
          this.$set(this.layerData, id, false) // 同步眼睛图标关闭
          return
        }
  
        // 关闭其它，打开当前
        this.leftData.forEach((item) => {
          item.showTable = item.id === id
          this.$set(this.layerData, item.id, item.showTable) // 同步眼睛图标状态
        })
  
        this.excelId = id
      },
      fwxShow(fwx) {
        fwx.show = !fwx.show
        const visible = fwx.layer.getVisible()
        fwx.layer.setVisible(!visible)
      },
      fwxDel(id) {
        this.delLayer(id)
        for (let i = 0; i < this.fwxLayerList.length; i++) {
          if (id == this.fwxLayerList[i].id) {
            this.fwxLayerList.splice(i, 1)
            break
          }
        }
      },
      fwxEdit(fwx) {
        console.log('this.editFwxLayer', this.editFwxLayer)
        console.log('this.fwxLayerList', this.fwxLayerList)
        console.log('fwx', this.fwx)
        this.editFwxLayer = fwx
        this.editFwxShow = true
      },
      resultLayerShow(item) {
        if (item.dataAjax) {
          this.geoJsonInitMap(item)
          return
        }
        let id = String(item.id)
        if (id.indexOf('_id_') != -1) id = id.split('_id_')[0]
        const params = {
          id,
        }
        showResultLayerStep1(params).then(() => {
          showResultLayerStep2(params).then((res) => {
            if (res.data.length === 0) return
            item.dataAjax = res.data[0].result
            this.geoJsonInitMap(item)
          })
        })
      },
      allLayersSetIndex() {
        let index = 9
        let layers = window.mapYzt.getLayers().getArray()
        let indexLayer
        for (let i = this.leftData.length - 1; i >= 0; i--) {
          indexLayer = layers.find((item) => item.get('id') == this.leftData[i].id)
          if (indexLayer) {
            indexLayer.setZIndex(index)
          }
          index++
        }
      },
      // 展示图层
      showLayers(e, item) {
        console.log(e, 'e')
        console.log(item, 'item')
  
        if (item.useType === 'result') {
          if (e) this.resultLayerShow(item)
          if (!e) this.delLayer(item.id)
        }
        if (item.useType === 'uploadData') {
          if (e) window.mapYzt.addLayer(item.resultLayer)
          if (!e) this.delLayer(item.id)
        }
        if (item.userType === 'tableData') {
          this.showTable(item.id)
          return
        }
        if (!item.service || !item.service.url || !item.id) return
        if (e) {
          this.addLayer(item)
          this.allLayersSetIndex()
        }
        if (!e) this.delLayer(item.id)
      },
      filterNode(value, data) {
        if (!value) return true
        return data.name.indexOf(value) !== -1
      },
      addCarts(data, num) {
        console.log(data, 'data')
        console.log(num, 'num')
        console.log(this.geoData, 'this.geoData')
  
        if (num < data.length) {
          var formData = new FormData()
          formData.append('serviceResourceInfoId', data[num].id)
          addToCarts(formData).then((res) => {
            if (res.code == 1) {
              this.$store.state.datamart.cartsCount++
            } else {
              //this.$elMessage.error(res.msg)
            }
            this.addCarts(data, num + 1)
          })
        } else {
          const hasFlag = this.geoData && this.geoData.hasOwnProperty('source') && this.geoData.source === 'default'
          console.log('hasFlag:', hasFlag)
          this.$router.push({
            name: 'datacarts',
            params: {
              type: 'fromdata',
              data: data,
              geoData: this.geoData,
              flag: hasFlag ? 'default' : 'null',
            },
          })
        }
      },
      drawPoly() {
        if (this.uploadLayer != null) {
          this.removeLayer(this.uploadLayer.id)
          this.uploadLayer = null
        }
        var this_ = this
        OpenLayerTool['clear']()
        OpenLayerTool['polygonSelect']().then((res) => {
          let geojsonFormat = new GeoJSON()
          let geojson = JSON.parse(geojsonFormat.writeGeometry(res.getGeometry()))
          let geometry = {
            coordinates: [geojson.coordinates],
            type: 'MultiPolygon',
          }
          let data = JSON.stringify({
            features: [
              {
                geometry: geometry,
                type: 'Feature',
                properties: {
                  type: '',
                },
              },
            ],
            type: 'FeatureCollection',
          })
          this_.geoData = {
            自定义范围: data,
          }
        })
      },
      apply() {
        if (this.leftData.length == 0) {
          return
        }
        var arr = []
        for (var i = 0; i < this.leftData.length; i++) {
          arr.push(this.leftData[i].id)
        }
        var str = arr.join(',')
        var params = {
          currPage: 1,
          pageSize: 999,
          theDicIds: str,
        }
        getServiceListByTreeId(params).then((res) => {
          if (res.code == 1) {
            var data = res.data.list
            if (data.length > 0) {
              this.addCarts(data, 0)
            }
          } else {
            this.$elMessage.error('选择的图层没有数据')
          }
        })
      },
      //获取图层缩略图
      getLayerImg(layer) {
        if (!layer.preview) {
          return '../images/dtree/gyslt.jpg'
        } else if (layer.preview.indexOf('http') != -1) {
          return layer.preview
        } else {
          return window.link.sltimage + layer.preview
        }
      },
      setView(id) {
        if (this.viewActiveId === id) {
          this.viewActiveId = null // 取消选中
        } else {
          this.viewActiveId = id // 选中当前
        }
        window.mapYzt.getView().setCenter([63382.58126396489, 240390.07329781773])
        window.mapYzt.getView().setZoom(10)
      },
      addLayer(data) {
        console.log(data, 'data')
        if (!data || !data.service) {
          console.warn('addLayer 参数缺少 service 属性：', data)
          return
        }
  
        let service = data.service
        let id = data.id
        const mapLayers = window.mapYzt.getLayers().getArray()
        const existsOnMap = mapLayers.some((layer) => layer.get('id') === id)
        if (existsOnMap) {
          console.warn('图层已存在地图中，跳过添加:', id)
          return
        }
        // for (let i = 0; i < this.leftData.length; i++) {
        //   if (id === this.leftData[i].id) {
        //     return;
        //   }
        // }
  
        let layer
        // if (service.type === 'WMS') {
        //   console.log(data, "1");
  
        //   // 1. 从 wmslayer 中提取图层名（如从 "dataCenterWorkspace:xxx" 取 xxx）
        //   const layerName = service.wmslayer.split(':')[1] || service.wmslayer;
        //   // 2. 构建元数据请求 URL
        //   const metadataUrl = `/geoserver/rest/workspaces/dataCenterWorkspace/datastores/shpStore/featuretypes/${layerName}.json`;
  
        //   // 3. 定义 Basic 认证信息（替换为实际的 GeoServer 用户名和密码）
        //   const geoServerUser = 'admin'; // 默认用户名，根据实际配置修改
        //   const geoServerPwd = 'GzpiGeoserver@2024'; // 默认密码，根据实际配置修改
        //   // 生成 Basic 认证的请求头（Base64 编码 "用户名:密码"）
        //   const authHeader = 'Basic ' + btoa(`${geoServerUser}:${geoServerPwd}`);
  
        //   // 4. 带认证请求元数据
        //   fetch(metadataUrl, {
        //     method: 'GET',
        //     headers: {
        //       'Authorization': authHeader, // 关键：添加 Basic 认证头
        //       'Content-Type': 'application/json'
        //     }
        //   })
        //     .then(response => {
        //       if (!response.ok) {
        //         throw new Error(`元数据请求失败：${response.status} ${response.statusText}`);
        //       }
        //       return response.json();
        //     })
        //     .then(metadata => {
        //       console.log('获取到图层元数据:', metadata);
  
        //       // 从元数据中提取经纬度范围（EPSG:4326）
        //       const bbox = metadata.featureType.latLonBoundingBox;
        //       if (!bbox) throw new Error('元数据中未找到经纬度范围');
  
        //       const extent4326 = [bbox.minx, bbox.miny, bbox.maxx, bbox.maxy];
  
        //       // 转换为地图使用的 EPSG:3857 投影
        //       const extent3857 = transformExtent(extent4326, 'EPSG:4326', 'EPSG:3857');
  
        //       // 6. 创建并添加 WMS 图层
        //       const layer = new ImageLayer({
        //         id: id,
        //         source: new ImageWMS({
        //           url: this.parseUrl(service.url),
        //           params: {
        //             LAYERS: service.wmslayer,
        //             FORMAT: 'image/png',
        //             time: new Date().getTime(),
        //             VERSION: '1.1.1',
        //             transparent: true,
        //             STYLES: '',
        //             SRS: 'EPSG:3857',
        //             exceptions: 'application/vnd.ogc.se_inimage',
        //             authkey: this.$ls.get('Access-Token'),
        //           },
        //           serverType: 'geoserver',
        //           projection: 'EPSG:3857',
        //           crossOrigin: 'anonymous',
        //           wrapX: false,
        //         }),
        //       });
  
        //       window.mapYzt.addLayer(layer);
        //       this.$set(this.layerData, id, true);
  
        //       // 使用转换后的范围定位
        //       setTimeout(() => {
        //         window.mapYzt.getView().fit(extent3857, {
        //           size: window.mapYzt.getSize(),
        //           padding: [50, 50, 50, 50],
        //           maxZoom: 18,
        //           duration: 800
        //         });
        //       }, 300);
        //     })
        //     .catch(error => {
        //       console.error('获取元数据或定位失败:', error.message);
  
        //       // 8. 错误处理：即使元数据获取失败，仍加载图层（无定位）
        //       const layer = new ImageLayer({
        //         id: id,
        //         source: new ImageWMS({
        //           url: this.parseUrl(service.url),
        //           params: {
        //             LAYERS: service.wmslayer,
        //             FORMAT: 'image/png',
        //             time: new Date().getTime(),
        //             VERSION: '1.1.1',
        //             transparent: true,
        //             STYLES: '',
        //             SRS: 'EPSG:3857',
        //             exceptions: 'application/vnd.ogc.se_inimage',
        //             authkey: this.$ls.get('Access-Token'),
        //           },
        //           serverType: 'geoserver',
        //           projection: 'EPSG:3857',
        //           crossOrigin: 'anonymous',
        //           wrapX: false,
        //         }),
        //       });
  
        //       window.mapYzt.addLayer(layer);
        //       this.$set(this.layerData, id, true);
  
        //       // 可选：错误时提示用户
        //       alert('图层已加载，但无法自动定位（元数据获取失败）');
        //     });
        // } 
          if (service.type == 'WMS') {
          // 添加GeoServer WMS服务图层
          layer = new ImageLayer({
            id: id,
            source: new ImageWMS({
              url: this.parseUrl(service.url),
              params: {
                LAYERS: service.wmslayer,
                FORMAT: 'image/png',
                time: new Date().getTime(),
                VERSION: '1.1.1',
                transparent: true,
                STYLES: '',
                SRS: 'EPSG:3857',
                exceptions: 'application/vnd.ogc.se_inimage',
                authkey: this.$ls.get('Access-Token'),
              },
              serverType: 'geoserver',
              projection: 'EPSG:3857',
              crossOrigin: 'anonymous',
              wrapX: false,
            }),
          })
  
          // 将GeoServer WMS服务图层添加到地图中
          window.mapYzt.addLayer(layer)
          this.$set(this.layerData, id, true)
        }
        else if (service.type == 'WMTS') {
          console.log(data, "2");
          const projection = get('EPSG:0')
          const resolutions = [
            156543.033928, 78271.516964, 39135.758482, 19567.879241, 9783.9396205, 4891.96981025, 2445.984905125,
            1222.9924525625, 611.49622628125, 305.748113140625, 152.8740565703125, 76.43702828515625, 38.21851414257812,
            19.10925707128906, 9.55462853564453, 4.777314267822265, 2.3886571339111327, 1.1943285669555663,
            0.5971642834777832, 0.2985821417388916, 0.1492910708694458,
          ]
          const matrixIds = new Array()
          for (let z = 0; z < resolutions.length; ++z) {
            matrixIds[z] = z
          }
          const tileGrid = new WMTSTileGrid({
            origin: [4052.3367, 320810.9101],
            resolutions: resolutions,
            matrixIds: matrixIds,
          })
          var wmtsLayer = new TileLayer({
            id: id,
            source: new WMTS({
              url: service.url,
              layer: service.wmslayer,
              matrixSet: 'gz2000',
              format: 'image/png',
              style: 'default',
              Version: '1.0.0',
              projection: projection,
              crossOrigin: 'anonymous',
              tileGrid: tileGrid,
              wrapX: true,
            }),
          })
          window.mapYzt.addLayer(wmtsLayer)
          this.$set(this.layerData, id, true)
        } else if (service.type == 'iserverWMS') {
          console.log(data, "3");
          layer = new TileLayer({
            id: id,
            source: new TileWMS({
              url: service.url,
              crossOrigin: 'anonymous',
              params: {
                LAYERS: service.wmslayer,
                FORMAT: 'image/png',
                VERSION: '1.1.1',
                transparent: true,
                SRS: 'EPSG:0',
              },
              projection: 'EPSG:0',
            }),
          })
          // 将GeoServer WMS服务图层添加到地图中
          window.mapYzt.addLayer(layer)
          this.$set(this.layerData, id, true)
        }
        // let item = JSON.parse(JSON.stringify(data));
        // item.opacity = 100
        // item.show = true
        // item.layer = layer
        // item.checked = true
        // this.leftData.push(item)
        if (service.type !== 'nonService') {
          const { layer: _layer, ...purePart } = data
  
          // 深拷贝
          let pureData = JSON.parse(JSON.stringify(purePart))
  
          let item = {
            ...pureData,
            opacity: 100,
            show: true,
            checked: true,
            layer: layer,
          }
  
          const exists = this.leftData.some((d) => d.id === item.id)
          if (!exists) {
            this.leftData.push(item)
          }
          console.log('图层添加完成', layer)
        } else if (service.type == 'nonService') {
          const newId = data.id
  
          const exists = this.leftData.some((item) => item.id === newId)
  
          if (exists) {
            this.$message.warning('该数据已添加')
            return
          }
  
          const tableName = data.service.pglayer ? data.service.pglayer.replace(/"/g, '') : ''
  
          // 如果没有 pglayer，直接添加到 leftData
          if (!tableName) {
            const item = {
              ...data,
              boxStyle: { width: '500px', height: '400px' },
              showTable: false, // 不显示表格
              userType: 'other',
            }
            this.leftData.push(item)
            this.$set(this.layerData, item.id, true)
            console.log('添加无表格数据到 leftData:', item)
            return // 直接返回，不执行后续表格预览逻辑
          }
  
          previewTableByName({ tableName })
            .then((res) => {
              console.log('预览结果:', res)
              const dataList = res.data || []
  
              const item = {
                ...data,
                excelData: dataList,
                excelColumns:
                  dataList.length > 0 ? Object.keys(dataList[0]).map((key) => ({ prop: key, label: key })) : [],
                boxStyle: { width: '500px', height: '400px' },
                showTable: true, // ✅ 显式添加
                userType: 'tableData',
              }
  
              this.excelId = item.id
              this.leftData.push(item)
              this.$set(this.layerData, item.id, true)
  
              console.log('添加后 leftData:', this.leftData)
            })
            .catch((err) => {
              console.error('接口调用失败:', err)
            })
        }
      },
      colorCode() {
        let arr = []
        for (let i = 0; i < 6; i++) {
          let tmp = parseInt(Math.random() * 123)
          if (tmp >= 0 && tmp <= 9) {
            arr.push(tmp)
          } else if (tmp >= 97 && tmp <= 102) {
            arr.push(String.fromCharCode(tmp))
          } else {
            //随机到别的不在范围内的数
            i--
          }
        }
        arr.unshift('#')
        return arr.join('')
      },
      outGeojson(feature, name) {
        console.log('feature', feature)
        let leftItem = {
          name,
          id: 'id_' + uuid.uuid(16, 32),
          style: Object.assign({}, this.styleConfigDefault, {
            color: this.colorCode(),
            fillColor: this.colorCode(),
          }),
          tableData: {},
          useType: 'uploadData',
          resultLayer: null,
          geojson: feature,
        }
        leftItem.tableData.tableData = feature.features.map((leftItem) => {
          return leftItem.properties
        })
        let tableHeader = Object.keys(leftItem.tableData.tableData[0])
        leftItem.tableData.tableHeader = tableHeader
        const vectorSource = new VectorSource({
          features: new GeoJSON().readFeatures(feature),
        })
        let resultLayer = new VectorLayer({
          id: leftItem.id,
          source: vectorSource,
          style: this.getStyle(leftItem.style),
        })
        leftItem.resultLayer = resultLayer
        leftItem.layer = resultLayer
        window.mapYzt.addLayer(resultLayer)
        this.$set(this.layerData, leftItem.id, true)
        this.leftData.unshift(leftItem)
      },
      parseUrl(url) {
        const regex = /^(https?):\/\/([^\/:]+)(?::(\d+))?/
        if (regex.test(url)) {
          return url.replace(regex, '')
        } else {
          return url
        }
      },
      layerShow(item) {
        console.log(item, 'item')
  
        item.show = !item.show
  
        const layer = item.layer || item.resultLayer
  
        if (item.useType === 'uploadData') {
          if (item.show) {
            // ✅ 判断图层是否已添加
            const layers = window.mapYzt.getLayers().getArray()
            const exists = layers.includes(item.resultLayer)
  
            if (!exists) {
              window.mapYzt.addLayer(item.resultLayer)
            }
          } else {
            this.delLayer(item.id)
          }
        } else {
          if (layer) {
            const isVisible = layer.getVisible()
            layer.setVisible(!isVisible)
          } else {
            console.warn('该图层没有 layer 或 resultLayer 属性', item)
          }
        }
      },
      delLayer(id) {
        let layers = window.mapYzt.getLayers().getArray()
        let delLayer = layers.find((item) => item.get('id') == id)
        if (delLayer) {
          window.mapYzt.removeLayer(delLayer)
        }
      },
      showOpacity(id) {
        if (this.opacityActiveId === id) {
          // 如果当前点击的是已经选中的按钮，则取消选中
          this.opacityActiveId = null
          $('#' + id + 'slider').hide()
        } else {
          // 点击新的按钮
          this.opacityActiveId = id
          // 先隐藏所有 slider，避免多个显示
          $('.slider').hide()
          $('#' + id + 'slider').show()
        }
      },
      setOpacity(val, item) {
        item.layer.setOpacity(val / 100)
      },
      removeLayer(id) {
        let layers = window.mapYzt.getLayers().getArray()
        let delLayer = layers.find((item) => item.get('id') == id)
        if (delLayer) {
          window.mapYzt.removeLayer(delLayer)
        }
        if (this.leftData) {
          for (let i = 0; i < this.leftData.length; i++) {
            if (id == this.leftData[i].id) {
              this.leftData.splice(i, 1)
              break
            }
          }
        }
        if (this.addFwxLayerList) {
          for (let i = 0; i < this.addFwxLayerList.length; i++) {
            if (id == this.addFwxLayerList[i].id) {
              this.addFwxLayerList.splice(i, 1)
              this.selectedRange = null
              break
            }
          }
        }
      },
      uploadsingleFile() {
        this.$refs.jzhcinputDom.click()
      },
      tirggerFile(event) {
        if (event.target.files.length == 1) {
          this.fileData = event.target.files[0]
          this.fileUpload = `文件名称 : ${this.fileData.name}, 文件大小: ${this.fileData.size} bytes, 文件类型: ${this.fileData.type}`
        } else {
          this.$notification.warning({
            message: '文件异常',
            description: `请上传单个文件`,
          })
        }
        event.target.value = ''
      },
      uploadFile() {
        if (!this.fileData) {
          this.$notification.warning({
            message: '文件缺失',
            description: `请上传文件`,
          })
          return
        }
        $('#loading').show()
        let newForm = new FormData()
        newForm.append('dataType', 'shp')
        newForm.append('file', this.fileData)
        shpToGeojson(newForm).then((res) => {
          if (res.code == 0) {
            this.fileData = null
            this.zxztFlag = false
            this.fileUpload = false
            this.$elMessage.info(res.msg)
            $('#loading').hide()
          } else if (res.data) {
            this.geoData = res.data
            for (const key in res.data) {
              if (Object.hasOwnProperty.call(res.data, key)) {
                const element = res.data[key]
                this.addFwx(key, element)
              }
            }
            this.$elMessage.success('范围线上传成功')
            $('#loading').hide()
            this.fileData = null
            this.zxztFlag = false
            this.fileUpload = false
          }
        })
      },
      addFwx(name, data) {
        OpenLayerTool['clear']()
        if (this.uploadLayer != null) {
          this.removeLayer(this.uploadLayer.id)
          this.uploadLayer = null
        }
        let feature = JSON.parse(data)
        let leftItem = {
          name: name,
          id: 'id_' + uuid.uuid(16, 32),
          style: Object.assign({}, this.styleConfigDefault),
          useType: 'uploadData',
          resultLayer: null,
          geojson: feature,
        }
        const vectorSource = new VectorSource({
          features: new GeoJSON().readFeatures(feature),
        })
        let resultLayer = new VectorLayer({
          id: leftItem.id,
          source: vectorSource,
          style: this.getStyle(leftItem.style),
        })
        leftItem.resultLayer = resultLayer
        window.mapYzt.addLayer(resultLayer)
        window.mapYzt.getView().fit(resultLayer.getSource().getExtent(), {
          size: window.mapYzt.getSize(),
          padding: [50, 50, 50, 50],
        })
        resultLayer.setZIndex(100)
        this.uploadLayer = leftItem
        this.addFwxLayerList.push(leftItem)
      },
  
      getStyle(style) {
        let common = {
          stroke: new Stroke({
            color: this.hex2Rgba(style.color, 0.5),
            // lineDash: [10, 10],
            width: style.weight,
          }),
        }
        return new Style({
          ...common,
          image: new CircleStyle({
            radius: style.radius,
            ...common,
          }),
        })
      },
  
      hex2Rgba(bgColor, alpha = 1) {
        // #0fa2f5 => rgba(15,162,245,1)
        let color = bgColor.slice(1) // 去掉'#'号
        let rgba = [
          parseInt('0x' + color.slice(0, 2)),
          parseInt('0x' + color.slice(2, 4)),
          parseInt('0x' + color.slice(4, 6)),
          alpha,
        ]
        return 'rgba(' + rgba.toString() + ')'
      },
      delAdd() {
        for (let i = this.leftData.length - 1; i >= 0; i--) {
          this.removeLayer(this.leftData[i].id)
        }
      },
      getGeojson(val) {
        console.log(val, 'val')
        console.log(val.name, 'val.name')
        console.log(val.feature, 'val.feature')
        this.outGeojson(val.feature, val.name)
      },
      toggleTable(id) {
        // 通过id修改对应项的 showTable 属性
        const item = this.leftData.find((item) => item.id === id)
        if (item) {
          item.showTable = !item.showTable
        }
      },
      onResizeStart(e) {
        const el = e.currentTarget
        const rect = el.getBoundingClientRect()
  
        // 判断是否点在右下角
        if (e.clientX >= rect.right - 20 && e.clientY >= rect.bottom - 20) {
          this.isResizing = true
          this.resizeStartX = e.clientX
          this.resizeStartY = e.clientY
          this.resizeStartWidth = rect.width
          this.resizeStartHeight = rect.height
          this.resizingElement = el
  
          document.addEventListener('mousemove', this.onResizing)
          document.addEventListener('mouseup', this.onResizeEnd)
        }
      },
  
      onResizing(e) {
        if (!this.isResizing || !this.resizingElement) return
  
        const dx = e.clientX - this.resizeStartX
        const dy = e.clientY - this.resizeStartY
  
        this.resizingElement.style.width = this.resizeStartWidth + dx + 'px'
        this.resizingElement.style.height = this.resizeStartHeight + dy + 'px'
      },
  
      onResizeEnd() {
        this.isResizing = false
        this.resizingElement = null
        document.removeEventListener('mousemove', this.onResizing)
        document.removeEventListener('mouseup', this.onResizeEnd)
      },
  
      onDragStart(index) {
        if (this.isResizing) return // 正在拉伸时禁止拖拽开始
        this.dragIndex = index
      },
  
      onDragEnd(event) {
        if (this.dragIndex === -1 || this.isResizing) return
  
        const targetElement = event.target.closest('.middle-box')
        if (!targetElement) return
  
        const targetIndex = Array.from(document.querySelectorAll('.middle-box')).indexOf(targetElement)
  
        if (this.dragIndex !== targetIndex && targetIndex !== -1) {
          const draggedItem = this.leftData.splice(this.dragIndex, 1)[0]
          this.leftData.splice(targetIndex, 0, draggedItem)
        }
  
        this.dragIndex = -1
      },
      getGeojson2(feature, server, name) {
        return new Promise((res) => {
          let param = {
            service: 'WFS',
            version: '1.1.0',
            request: 'GetFeature',
            typeName: server.wmslayer,
            outputFormat: 'application/json',
            srsName: 'EPSG:4326',
            authkey: this.$ls.get('Access-Token'),
          }
          if (feature.getGeometry().getType() == 'Circle') {
            param.CQL_FILTER = `DWITHIN(the_geom, POINT(${feature.getGeometry().getCenter().join(' ')}), ${feature
              .getGeometry()
              .getRadius()}, meters)`
          } else {
            let strPoint = ''
            feature
              .getGeometry()
              .getCoordinates()[0]
              .forEach((item, index) => {
                if (index > 0) {
                  strPoint += ','
                }
                strPoint += item.join(' ')
              })
            param.CQL_FILTER = `INTERSECTS(the_geom, POLYGON((${strPoint})))`
          }
          axios({
            method: 'post',
            url: '/geoserver/dataCenterWorkspace/ows',
            params: param,
          }).then((datas) => {
            res({
              name,
              data: datas.data.features,
            })
          })
        })
      },
    },
    mounted() {
      window.aa = this
      OpenLayerTool['clear']()
      getLayerDataList1()
        .then((res) => {
          this.layerList = res.data
        })
        .catch((error) => { })
      this.linkArr = this.leftData
      // 文件拖拽功能
      let _this = this
      let drapArr = []
      drapArr.push(document.getElementById('jzhcdropZone'))
      let findArr = document.querySelectorAll('#jzhcdropZone > div')
      drapArr.push(...findArr)
  
      function preventDefaults(e) {
        e.preventDefault()
        e.stopPropagation()
      }
      const dropZone = document.getElementById('jzhcdropZone')
      // dropZone.addEventListener('dragover', preventDefaults, false)
      document.body.addEventListener('dragover', preventDefaults, false)
      drapArr.forEach((item) => {
        item.addEventListener('dragover', preventDefaults, false)
        item.addEventListener(
          'dragenter',
          (e) => {
            e.preventDefault()
            e.stopPropagation()
            dropZone.classList.add('hover')
          },
          false
        )
  
        // 处理文件拖拽事件
        item.addEventListener('drop', handleDrop, false)
      })
  
      function handleDrop(e) {
        e.preventDefault()
        e.stopPropagation()
        dropZone.classList.remove('hover')
        const dt = e.dataTransfer
        const files = dt.files
        if (files.length > 1) {
          _this.$notification.warning({
            message: '文件限制',
            description: `请上传一个文件`,
          })
          return
        }
        _this.fileUpload = `文件名称 : ${files[0].name}, 文件大小: ${files[0].size} bytes`
        _this.fileData = files[0]
      }
      this.$eventBus.$on('drawEndData', (res) => {
        console.log(res, 333)
        let promistList = []
        this.leftData.forEach((item) => {
          console.log('this.leftData', this.leftData)
          console.log(item, 'item')
  
          if (item.service && item.service.type == 'WMS') {
            promistList.push(this.getGeojson2(res, item.service, item.name))
          }
        })
        console.log(promistList, 333, 'p')
        Promise.all(promistList).then((resArr) => {
          let resultList = []
          resArr.forEach((item) => {
            if (item.data && item.data.length > 0) {
              let keyFiled = {}
              Object.keys(item.data[0].properties).forEach((item) => {
                keyFiled[item] = item
              })
              let resultItem = {
                name: item.name,
                id: uuid.uuid(16, 32),
                keyFiled,
                value: item.data.map((item) => item.properties),
              }
              resultList.push(resultItem)
            }
          })
          console.log(resultList, 333, 'r')
          if (resultList.length > 0) {
            this.resultShow = true
            this.$eventBus.$emit('isearchData', resultList)
          }
        })
        return
      })
      // 初始化地图信息
      register(window.Proj4js)
      let projection = getProjection('EPSG:0')
      projection.setExtent([-52994.60069444445, 146144.3396833327, 177894.5381944445, 377033.47857222165])
      const projectionExtent = projection.getExtent()
      const size = projectionExtent[2] - projectionExtent[0]
      const resolutions = []
      for (let z = 0; z < 22; ++z) {
        resolutions[z] = size / Math.pow(2, z)
      }
      const map = (this._pmap = new Map({
        target: 'map',
        view: new View({
          center: transform([113.23, 23.23], 'EPSG:4326', 'EPSG:0'),
          // center: [63382.58126396489, 240390.07329781773],
          zoom: 10,
          resolutions: resolutions,
        }),
        controls: control.defaults({
          attribution: true,
          zoom: true,
          rotate: true,
        }),
      }))
  
      const parser = new WMTSCapabilities()
      fetch(
        'http://192.168.3.140:6080/arcgis/rest/services/FW_GZ2000_new/fw_dt/MapServer/WMTS/1.0.0/WMTSCapabilities.xml'
      )
        .then((response) => response.text())
        .then((text) => {
          const result = parser.read(text)
  
          // 2. 解析 WMTS 服务的配置信息
          const options = optionsFromCapabilities(result, {
            layer: 'FW_GZ2000_new_fw_dt', // 替换为实际的图层名称
            matrixSet: 'EPSG:0', // 替换为实际的矩阵集标识符（通常是投影）
            crossOrigin: 'anonymous',
          })
          const arcgisTileLayer = new TileLayer({
            source: new WMTS(options),
          })
          map.addLayer(arcgisTileLayer)
          arcgisTileLayer.setZIndex(0)
          const params = this.$route.params
          if (params.servicedicId) {
            let data = {
              id: params.servicedicId,
              name: params.serviceName,
              service: {
                type: params.serviceType,
                url: params.serviceAddress,
                wmslayer: params.layerName,
              },
            }
            this.addLayer(data)
          }
        })
      window.mapYzt = map
      initOpenLayer()
    },
  }
  </script>
  <style lang="scss">
  .geom {
    .el-tree {
      background: #fff0;
    }
  
    .el-tree-node__content {
      height: 100%;
    }
  }
  </style>
  <style scoped lang='scss'>
  .geom {
    width: 100%;
    height: 100%;
    position: relative;
  
    #map {
      width: 100%;
      height: 100%;
    }
  
    .right-box {
      width: 400px;
      height: calc(100% - 2px);
      position: absolute;
      right: 0;
      top: 0;
      border: 1px solid #ebeef5;
      transition: all 0.5s;
  
      .head_fun {
        width: 100%;
        height: 40px;
        background: rgba(255, 255, 255, 1);
  
        .tool_p {
          color: rgba(96, 160, 241, 1);
          line-height: 40px;
          text-indent: 0.5rem;
        }
  
        .tool_close {
          position: absolute;
          top: 12px;
          right: 10px;
          cursor: pointer;
        }
      }
  
      .right_content {
        width: 100%;
        height: calc(100% - 40px);
        background-color: #fff;
        padding: 10px;
  
        .select-section {
          display: flex;
          align-items: center;
          gap: 10px;
          /* 控制标题和下拉框的间距，可根据需要调整 */
          margin-bottom: 10px;
  
          .title {
            white-space: nowrap;
            font-size: 14px;
            color: #60a0f1;
          }
  
          .el-select {
            flex: 1; // 下拉框占据剩余宽度（可选）
          }
        }
  
        .btn_ztt {
          display: flex;
          width: 100%;
          justify-content: space-between;
          // cursor: pointer;
          padding: 20px 0;
  
          .add_ztt {
            font-weight: bold;
            border: none;
            border-radius: 4px;
            outline: none;
            background: linear-gradient(221.19deg, #2a9df2 0%, #57abfa 100%);
            color: #ffffff;
            cursor: pointer;
            padding: 10px 20px;
            margin-left: 20px;
          }
        }
  
        .fwx_layers {
          width: 100%;
          height: calc(100% - 400px);
          overflow: auto;
          padding: 10px;
          background: rgba(244, 249, 253, 1);
  
          .largeSize {
            height: 70px;
            // margin-bottom: 25px;
            width: 100%;
            list-style: none;
            // background-color: #e8e8e8;
            color: rgba(255, 255, 255, 0.85);
            // border: 1px solid #e8e8e8;
            border-radius: 4px;
            display: flex;
            justify-content: space-between; // 将子项分开
            flex-direction: column;
  
            .first-line {
              margin-top: 10px;
              background: rgba(255, 255, 255, 1);
  
              .layer-icon {
                display: inline-block;
                width: 22px;
                height: 22px;
                margin-left: 16px;
                border-radius: 50%;
                line-height: 22px;
                text-align: center;
                cursor: pointer;
  
                span {
                  color: #3499e5;
                }
              }
  
              .layertitle {
                vertical-align: top;
                margin-left: 10px;
                display: inline-block;
                overflow: hidden;
                text-overflow: ellipsis; // 使文字超长时显示省略号
                white-space: nowrap; // 防止文字换行
                width: 220px; // 限制宽度
  
                span {
                  color: black;
                  font-size: 16px;
                  display: inline-block;
                  max-width: 100%;
                  overflow: hidden;
                  text-overflow: ellipsis;
                  white-space: nowrap;
                }
              }
            }
  
            .grayhr {
              margin-top: 0;
              margin-bottom: 0;
              border: 0;
              border-top: 2px solid #cccccc94;
              width: 180px;
              margin-left: 40px;
            }
  
            .secound-line {
              margin-bottom: 5px;
  
              margin-top: 15px;
              display: flex;
              flex-direction: row;
              align-items: baseline;
              justify-content: space-around;
  
              .active-text {
                color: #409eff;
                /* Element UI 的主题蓝色 */
                font-weight: bold;
              }
  
              span {
                margin-right: 11px;
                margin-top: -5px;
                font-size: 14px;
                cursor: pointer;
                color: #4f505091;
              }
            }
  
            .slider {
              display: none;
            }
          }
        }
  
        .upload-card {
          background: rgba(2, 131, 237, 0.08);
          border-radius: 4px;
          padding: 8px;
          margin-bottom: 5px;
  
          .upload-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
  
            .upload-left {
              display: flex;
              align-items: center;
  
              i {
                margin-right: 8px;
                color: #60a0f1;
              }
  
              span {
                font-size: 14px;
                color: #333;
              }
            }
  
            .browse-btn {
              width: auto; // 让按钮自适应宽度
              padding: 8px 20px;
              color: rgba(2, 131, 237, 1);
              background-color: #409eff;
              border-color: #409eff;
              background: none;
              border: none;
            }
          }
        }
  
        .list-card {
          flex: 1;
          background: rgba(201, 227, 255, 1);
          border-radius: 4px;
          margin-bottom: 15px;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
          display: flex;
          flex-direction: column;
  
          .list-header {
            padding: 12px 15px;
            border-bottom: 1px solid #eee;
            font-size: 14px;
            color: #333;
          }
  
          .list-content {
            // flex: 1;
            overflow-y: hidden;
            padding: 10px;
            height: 130px;
  
            .list-item {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 10px;
              margin-bottom: 8px;
              background: white;
              border-radius: 4px;
  
              .item-left {
                display: flex;
                align-items: center;
  
                .item-icon {
                  width: 24px;
                  height: 24px;
                  margin-right: 10px;
                }
  
                .item-name {
                  font-size: 14px;
                  color: #333;
                }
              }
  
              .remove-icon {
                color: #f56c6c;
                cursor: pointer;
                font-size: 16px;
  
                &:hover {
                  color: #f78989;
                }
              }
            }
  
            .empty-tip {
              text-align: center;
              color: #999;
              padding: 20px 0;
            }
          }
        }
      }
    }
  
    .middle-box {
      resize: both;
      overflow: hidden;
      position: absolute;
      top: 0;
      left: 400px;
      /* 等于 .left-box 宽度 */
      // right: 400px;
      /* 等于 .right-box 宽度 */
      height: 600px;
      width: 800px;
      background: #fff;
      z-index: 999;
  
      // overflow: hidden;
      .table-header {
        font-size: 16px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 16px;
        padding: 8px;
        flex-shrink: 0;
        z-index: 999;
  
        .table-button {
          align-items: center;
          font-size: 16px;
          padding: 8px;
          flex-shrink: 0;
          z-index:999;
          pointer-events: auto;
          /* 确保按钮可以接收点击事件 */
        }
      }
  
      .table-box {
        overflow: auto;
        height: calc(100% - 40px);
      }
    }
  
    .left-box {
      width: 400px;
      height: calc(100% - 2px);
      position: absolute;
      left: 5px;
      top: 0;
      border: 1px solid #ebeef5;
      transition: all 0.5s;
  
      .head_fun {
        width: 100%;
        height: 40px;
        background: rgba(255, 255, 255, 1);
  
        .tool_hd {
          cursor: pointer;
          position: absolute;
          width: 20px;
          top: 26px;
          right: 18px;
          color: rgb(96, 160, 241);
          font-size: 20px;
        }
      }
  
      .left_content {
        width: 100%;
        height: calc(100% - 40px);
        background-color: #fff;
        padding: 20px 10px;
  
        .tree-list {
          height: calc(100% - 60px);
          background-color: rgb(244, 249, 253, 1);
          overflow: auto;
  
          .custom-tree-node {
            width: 100%;
          }
  
          .layerli {
            // height: 50px;
            // border-radius: 5px;
            // // box-shadow: 0px 5px 10px 0px rgb(25 23 23 / 20%);
            // display: flex;
            // align-items: center;
            // position: relative;
            display: flex;
            align-items: center;
            width: 100%;
            box-sizing: border-box;
            gap: 6px;
  
            /* 增加左右间距 */
            .layer_name {
              // width: 100%;
              // padding: 8px 5px;
              // color: #000;
              // font-size: 16px;
              // text-overflow: ellipsis;
              display: inline-block;
              max-width: 200px;
              /* 控制最大宽度，你可以根据实际情况调小或调大 */
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
              vertical-align: middle;
            }
  
            p {
              padding: 3px;
              margin-bottom: 0px !important;
            }
  
            .layer_img {
              // width: 16px;
              // height: 16px;
              // position: absolute;
              // left: 25px;
              // top: 18px;
              width: 16px;
              height: 16px;
              margin-right: 6px;
              flex-shrink: 0;
              // margin-right: 10px;
            }
  
            .layer_item {
              // margin-left: 20px;
              width: 80%;
              // overflow: hidden;
              // max-width: 100%;
              // flex: 1; /* 自动占满中间 */
              /* 固定宽度 */
              overflow: hidden;
  
              /* 让 ellipsis 生效 */
            }
  
            .add-icon {
              // position: absolute;
              // right: 20px;
              margin-left: auto;
              /* 自动推到最右边 */
              margin-right: 10px;
              flex-shrink: 0;
            }
          }
        }
      }
    }
  
    .jzhcdragUploadBox {
      position: fixed;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      background: rgba(255, 255, 255, 1);
      padding: 18px 30px;
  
      .jzhctitleBox {
        display: flex;
        justify-content: space-between;
        color: #3981df;
        // height: 51px;
        // border-bottom: 1px solid #ddd;
  
        >div:nth-of-type(1) {
          font-size: 18px;
          font-weight: 500;
          color: rgba(0, 0, 0, 1);
        }
  
        >div:nth-of-type(2) {
          font-size: 14px;
        }
      }
  
      #jzhcdropZone {
        width: 570px;
        height: 154px;
        border: 1px solid rgba(233, 244, 253, 1);
        background: rgba(233, 249, 253, 1);
        border-radius: 5px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        margin: 22px auto 12px;
        text-align: center;
  
        .jzhcdropZoneTitle {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 100%;
  
          .upload-icon {
            width: 72px;
            margin-bottom: 12px; // 图标和文字之间的间距
          }
  
          .upload-text {
            display: flex;
            flex-direction: column;
  
            span {
              color: #3981df;
              cursor: pointer;
              font-size: 16px; // 调整文字大小
              line-height: 1.5;
            }
          }
        }
  
        .jzhcdropZoneinfo {
          font-size: 14px; // 调整提示文字大小
          color: #b6bcc1;
          margin-top: 8px; // 与上方内容的间距
        }
  
        &.hover {
          background: rgba(255, 255, 255, 1);
        }
      }
  
      #jzhcfileInfo {
        margin: 22px auto 12px;
        padding: 10px;  }
  
      .jzhcbtnBox {
        display: flex;
        justify-content: flex-end;
  
        button {
          margin-right: 8px;
        }
      }
    }
  
    .analysVue {
      // pointer-events: none;
    }
  }
  </style>
  <style scoped>
  .custom-checkbox /deep/ .el-checkbox-button__inner {
    background: none !important;
    border: none !important;
    color: #606266 !important;
    box-shadow: none !important;
    border-radius: 0 !important;
    padding: 5px 10px;
  }
  
  .el-checkbox-button:first-child /deep/ .el-checkbox-button__inner {
    border-radius: 0 !important;
  }
  </style>
  
<template>
    <div class="page">
        <div id="map" class="map" ref="map" v-bind:style="{ width: mapWidth + 'px', height: mapHeight + 'px'}"></div>
        <el-button type="primary" icon="el-icon-circle-plus-outline" circle
                   @click="drawer=true,add=true,edit=false,formInline.target=nodes.length>0?nodes.length:0"
                   @mouseover.native="mouseOver"
                   @mouseleave.native="mouseLeave"
                   id="float-add" class="foot-button"></el-button>
        <el-button type="primary" icon="el-icon-edit" circle
                   @click="drawer=true,add=false,edit=true,formInline.target=nodes.length-1"
                   @mouseover.native="mouseOver"
                   @mouseleave.native="mouseLeave"
                   id="float" class="foot-button"></el-button>

        <el-drawer
            ref="drawer"
            title="新增/编辑节点"
            :visible.sync="drawer"
            :direction="direction"
            :before-close="handleClose"
            :with-header="false"
        >
            <div id="form">
                <el-form ref="form" :model="formInline" label-width="150px">
                    <el-form-item label="当前节点姓名">
                        <el-input v-model="formInline.name" placeholder="姓名" autofocus></el-input>
                    </el-form-item>
                    <el-form-item label="当前节点头像/照片">
                        <el-input v-model="formInline.avatarName" v-show="true" placeholder="头像/照片"></el-input>
                        <el-input v-model="formInline.avatar" v-show="false" placeholder="头像/照片"></el-input>
                        <el-select v-model="formInline.avatar" v-show="false" @change="formatName" placeholder="头像/照片">
                            <div v-if="imgs.length>0">
                                <el-option v-for="item in imgs.length" :key="item-1" :label="imgs[item-1]" :value="item-1"></el-option >
                            </div>
                            <div v-else>
                                <el-option :label="0" :value="0">无</el-option >
                            </div>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="当前节点" v-show="edit">
                        <el-input v-model="formInline.target" v-show="false" placeholder="目标节点"></el-input>
                        <el-select v-model="formInline.target" placeholder="当前节点">
                            <div v-if="nodes.length>0">
                                <el-option v-for="item in nodes.length" :key="item-1" :label="nodes[item-1].name" :value="item-1"></el-option >
                            </div>
                            <div v-else>
                                <el-option :label="0" :value="0">无</el-option >
                            </div>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="上级关系人">
                        <el-select v-model="formInline.source" placeholder="上级关系人">
                            <div v-if="nodes.length>0">
                                <el-option v-for="item in nodes.length" :key="item-1" :label="nodes[item-1].name" :value="item-1"></el-option >
                            </div>
                            <div v-else>
                                <el-option :label="0" :value="0">无</el-option >
                            </div>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="关系描述">
                        <el-input v-model="formInline.relation" placeholder="关系描述"></el-input>
                    </el-form-item>
                    <el-form-item label="关系颜色">
                        <el-input v-model="formInline.color" v-show="false" placeholder="关系颜色"></el-input>
                        <el-color-picker v-model="formInline.color" @change="formatColor"></el-color-picker>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="$refs.drawer.closeDrawer()" :loading="loading">{{ loading ? '提交中 ...' : '确 定' }}</el-button>
                        <el-button type="warning" @click="cancelForm" >取 消</el-button>
                    </el-form-item>
                </el-form>
            </div>
        </el-drawer>

    </div>
</template>

<script>
    import RelationChart from 'relation-chart';
    import $ from 'jquery'

    let config = {
        r:30,
        strokeColor: '#031f2a',
        strokeWidth:1,
    }
    let node = [
        // {
        //     "role_id":0,
        //     "group": 1,
        //     "name": "路人甲",
        //     "avatar": require("@/assets/img/李四.png")
        // },
        // {
        //     "role_id":1,
        //     "group": 1,
        //     "name": "路人乙",
        //     "avatar": require("../assets/img/张三.png")
        // },
        // {
        //     "role_id":2,
        //     "group": 1,
        //     "name": "路人丙",
        //     "avatar": require("../assets/img/140646844806.jpg")
        // },
    ];
    let links = [
        // {
        //     "source": 0,            // 起始节点在 nodes[] 中的索引
        //     "target": 1,            // 目标节点在 nodes[] 中的索引
        //     "relation": "朋友",      // 关系名称
        //     "color": "734646"       // 自定义细条颜色,#734646
        // },
        // {
        //     "source": 1,
        //     "target": 2,
        //     "relation": "女朋友",
        //     "color": "734646"
        // },
    ];
    let data = {
        mapWidth:document.documentElement.clientWidth-50,
        mapHeight:document.documentElement.clientHeight-50,

        // 节点列表
        nodes:node,
        // 线条列表
        links:links,

        drawer:false,
        direction:'ltr', //ltr,rtl,ttb,btt
        loading: false,
        add:false,
        edit:false,

        imgsPath:[],
        imgsSuffix:[],
        imgs:[],
        formInline: {
            name: '',
            avatarName: '',
            avatar: '',
            source: '',
            target: node.length,
            relation: '',
            color: 'e3dce3',
        },
        timer: null,

        dialogImageUrl: '',
        dialogVisible: false,
        disabled: false,
    };

    export default {
        name: "RelationMain",

        data(){
            return data;
        },
        mounted() {
            new RelationChart(this.$refs.map, data, config)
        },
        created() {
            this.requireImgs();
        },
        methods: {
            handleClose(done) {
                this.$confirm('请确认关系准确？')
                    .then(_ => {
                        if (this.loading) {
                            return;
                        }
                        // if (this.formInline.avatar.length < 1){
                        //     this.$message.error('请选择当前人员照片/头像！');
                        //     return false;
                        // }
                        if (this.formInline.name.length < 1){
                            this.$message.error('请选择当前人员照片/头像或者输入姓名！');
                            return false;
                        }
                        if (this.formInline.source.length < 1){
                            this.$message.error('请选择当前人员的上级关系人！');
                            return false;
                        }
                        if (this.formInline.target>0 && this.formInline.relation.length < 1){
                            this.$message.error('请选择当前人员的与上级人员的关系描述！');
                            return false;
                        }
                        if (this.formInline.target<0){
                            this.$message.error('非法操作！');
                            return false;
                        }
                        if (this.formInline.target>0 && this.formInline.target == this.formInline.source){
                            this.$message.error('当前节点和上级关系节点不能相同！');
                            return false;
                        }
                        this.$nextTick(()=>{
                            $(".svgclass").remove();
                            let nodeStr = {
                                "role_id":this.formInline.name,
                                "group": 1,
                                "name": this.formInline.name,
                                "avatar": "./img/"+this.formInline.avatarName
                                // "avatar": require("@/assets/img/"+this.imgs[this.formInline.avatar]+"."+this.imgsSuffix[this.formInline.avatar])
                            }
                            let linkStr = {
                                "source": this.formInline.source,
                                "target": this.formInline.target,
                                "relation": this.formInline.relation,
                                "color": this.formInline.color
                            }
                            if (this.edit){
                                let targetName = node[this.formInline.target].name;
                                let sourceName = node[this.formInline.source].name;
                                node[this.formInline.target].role_id = nodeStr.role_id
                                node[this.formInline.target].name = nodeStr.name
                                node[this.formInline.target].avatar = nodeStr.avatar
                                // node.splice(this.formInline.target,1, nodeStr);
                                if (links.length>0){
                                    for (let i = 0; i < links.length; i++) {
                                        if (links[i].source.name==sourceName && links[i].target.name==targetName){
                                            links.splice(i,1)
                                        }
                                    }
                                }
                            }else {
                                node.push(nodeStr);
                            }

                            if (node.length>1)links.push(linkStr)

                            new RelationChart(this.$refs.map, data, config);
                            this.formInline.target = node.length;
                        })

                        this.loading = true;
                        this.timer = setTimeout(() => {
                            done();
                            // 动画关闭
                            setTimeout(() => {
                                this.loading = false;
                            }, 400);
                        }, 800);
                    })
                    .catch(_ => {
                        this.cancelForm()
                    });
            },
            formatColor(color) {
                this.formInline.color = color.slice(1);
            },
            cancelForm() {
                this.loading = false;
                this.dialog = false;
                clearTimeout(this.timer);
                this.drawer = false;
            },
            requireImgs () {
                const requireAll = requireContext => requireContext.keys().map(requireContext)
                // const req = require.context('@/assets/img', false, /\.*/)
                const req = require.context('@/../img', false, /\.*/)
                this.imgsPath = requireAll(req);
                for (let i = 0; i < this.imgsPath.length; i++) {
                    let imgName = this.imgsPath[i].match(/img\/(.*)\./)[1].split('.')[0];
                    let imgSplit = this.imgsPath[i].split('.');
                    let imgSuffix = imgSplit[imgSplit.length-1];
                    this.imgs.push(imgName);
                    this.imgsSuffix.push(imgSuffix)
                }
            },
            formatName(imgId){
                this.formInline.name = this.imgs[imgId]
            },
            mouseOver(){
                $("#float-add").removeClass('foot-button');
                $("#float").removeClass('foot-button');
            },
            mouseLeave(){
                setTimeout(function () {
                    if (this.showFlag) {
                        this.showFlag = false
                    }
                    $("#float-add").addClass('foot-button');
                    $("#float").addClass('foot-button');
                },5000)
            }
        }
    }
</script>

<style scoped>
    #form{
        margin: 10px;
    }
    #float-add{
        z-index: 800;
        position: fixed;
        bottom: 38%;
        right: 1%;
    }
    #float{
        z-index: 800;
        position: fixed;
        bottom: 32%;
        right: 1%;
    }
    .foot-button{
        right: -20px !important;
        opacity: 0.2;
    }
</style>

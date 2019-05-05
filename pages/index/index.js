var app = getApp();
//获取应用实例
var WxParse = require('../../wxParse/wxParse.js');
var shopCartsJSON = require('../../utils/shopCartsJSON.js')
var mainPicHeight = 0;
var imageSizeArr = new Array();
var colorCssArr = new Array();
var colorIndexJson = {};
var scaleCssArr = new Array();
var scaleIndexJson = {};
var skuObjectArr = new Array();
Page({
    data: {
        showModal: false,
        bargainStatus: false,
        FriendStatus: false,
        isCuted: false,
        cutOnLine: false,
        collectStatus: false,
        chooseIndex: 0,
    },
    changeTabs(e) {
        let that = this;
        let index = e.currentTarget.dataset.index;
        if (that.data.chooseIndex == index) return false;
        if (index == 0) {
            goToPage(0)
        } else if (index == 1) {
            goToPage(581)
        }
        that.setData({
            chooseIndex: index
        })
    },
    //初始化数据
    onLoad: function(options) {
        let that = this;
        mainPicHeight = 0;
        imageSizeArr = new Array();
        colorCssArr = new Array();
        colorIndexJson = {};
        scaleCssArr = new Array();
        scaleIndexJson = {};
        skuObjectArr = new Array();
        // console.log(options)
        let itemInfo = shopCartsJSON.shopCartsJSON.data;
        // console.log(itemInfo);
        let mainPic = JSON.parse(itemInfo.mainPic);
        let freight = itemInfo.freight;
        itemInfo.itemSkus.map(function(itemSku) {
            let skuObject = {};
            skuObject.skuId = itemSku.id;
            skuObject.skuPic = itemSku.skuPic;
            if (itemSku.color !== null && itemSku.color !== undefined && itemSku.color.trim() !== '') {
                skuObject.color = itemSku.color.trim();
            } else {
                skuObject.color = null;
            }
            if (itemSku.scale !== null && itemSku.scale !== undefined && itemSku.scale.trim() !== '') {
                skuObject.scale = itemSku.scale.trim();
            } else {
                skuObject.scale = null;
            }
            skuObject.sysInventory = itemSku.sysInventory;
            skuObject.salePrice = itemSku.salePrice;
            skuObjectArr.push(skuObject);
        });
        for (let i = 0; i < itemInfo.colorList.length; i++) {
            colorIndexJson[itemInfo.colorList[i]] = i;
        }
        for (let i = 0; i < itemInfo.scaleList.length; i++) {
            scaleIndexJson[itemInfo.scaleList[i]] = i;
        }
        // console.log(colorIndexJson);
        // console.log(scaleIndexJson);
        // console.log(skuObjectArr);

        let itemBrandArr = itemInfo.brand.split('->');
        that.setData({
            mainPicList: mainPic.picList,
            mainPicIndex: Number(mainPic.mainPicNum) - 1,
            itemName: itemInfo.name,
            itemBrand: itemBrandArr[0],
            salePriceStr: itemInfo.priceRange,
            skuSalePrice: itemInfo.priceRange,
            origin: itemInfo.originPrice,
            totalSysInventory: itemInfo.totalSysInventory,
            skuInventory: itemInfo.totalSysInventory,
            buyNum: 1,
            freight: (freight > 0 ? freight : '免运费'),
            reduceBuyNumCss: 'noClick',
            addBuyNumCss: 'canClick',
            saleCount: parseInt((itemInfo.saleCount + 10) * 1.3),
            colorList: itemInfo.colorList,
            scaleList: itemInfo.scaleList,
            colorCssArr: colorCssArr,
            scaleCssArr: scaleCssArr,
            selectSkuId: null,
            selectColor: null,
            selectScale: null,
            shoppingCartSkuPic: mainPic.picList[Number(mainPic.mainPicNum) - 1].url,
            isSale: itemInfo.isSale,
            status: itemInfo.status,
        });
        WxParse.wxParse('article', 'html', itemInfo.detail, that, 5);
    },
    //加入购物车弹出
    showModal: function(e) {
        var animation = wx.createAnimation({
            duration: 300,
            timingFunction: "linear",
            delay: 0
        })
        this.animation = animation;
        animation.translateY("100%").step();
        this.setData({
            animationData: animation.export(),
            showModalStatus: true,
            position: e.currentTarget.dataset.position
        })
        setTimeout(function() {
            animation.translateY(0).step();
            this.setData({
                animationData: animation.export()
            })
        }.bind(this), 300);
    },
    //加入购物车隐藏
    hideModal: function() {
        var animation = wx.createAnimation({
            duration: 300,
            timingFunction: "linear",
            delay: 0
        })
        this.animation = animation
        animation.translateY("100%").step();
        this.setData({
            animationData: animation.export(),
        })
        setTimeout(function() {
            animation.translateY(0).step();
            this.setData({
                animationData: animation.export(),
                showModalStatus: false
            })
        }.bind(this), 300);
    },
    //增加购买数量
    addBuyNum: function() {
        if (this.data.buyNum == this.data.skuInventory) {
            return;
        }
        var buyNum = ++this.data.buyNum;
        var addBuyNumCss = 'canClick';
        if (buyNum == this.data.skuInventory) {
            addBuyNumCss = 'noClick';
        }
        this.setData({
            buyNum: buyNum,
            reduceBuyNumCss: 'canClick',
            addBuyNumCss: addBuyNumCss
        });
    },
    //减少购买数量
    reduceBuyNum: function() {
        if (this.data.buyNum == 1) {
            return;
        }
        var buyNum = --this.data.buyNum;
        var reduceBuyNumCss = 'canClick';
        if (buyNum == 1) {
            reduceBuyNumCss = 'noClick';
        }
        this.setData({
            buyNum: buyNum,
            reduceBuyNumCss: reduceBuyNumCss,
            addBuyNumCss: 'canClick'
        });
    },
    //选择颜色
    selectColorFun: function(e) {
        // console.log(e)
        if (e.target.dataset.css == "unavailable") return;

        let selectColor = null;
        if (this.data.selectColor === null) {
            selectColor = e.target.dataset.color;
        } else if (this.data.selectColor != e.target.dataset.color) {
            selectColor = e.target.dataset.color;
        }
        //console.log(selectColor);

        this.selectColorScaleFun(selectColor, this.data.selectScale);
    },
    //选择尺寸
    selectScaleFun: function(e) {
        if (e.target.dataset.css == "unavailable") return;

        let selectScale = null;
        if (this.data.selectScale === null) {
            selectScale = e.target.dataset.scale;
        } else if (this.data.selectScale != e.target.dataset.scale) {
            selectScale = e.target.dataset.scale;
        }
        //console.log(selectScale);

        this.selectColorScaleFun(this.data.selectColor, selectScale);
    },
    selectColorScaleFun: function(selectColor, selectScale) {
        let selectSkuId = null;
        let skuInventory = 0;
        let colorList = this.data.colorList;
        let scaleList = this.data.scaleList;
        let skuSalePrice = this.data.salePriceStr;
        let shoppingCartSkuPic = this.data.shoppingCartSkuPic;

        if (selectColor !== null && selectScale !== null) { //选中颜色、尺寸
            for (let i = 0; i < colorList.length; i++) {
                colorCssArr[i] = "unavailable";
            }
            for (let i = 0; i < scaleList.length; i++) {
                scaleCssArr[i] = "unavailable";
            }
            for (let i = 0; i < skuObjectArr.length; i++) {
                if (selectColor == skuObjectArr[i].color && selectScale == skuObjectArr[i].scale) {
                    selectSkuId = skuObjectArr[i].skuId;
                    skuInventory = skuObjectArr[i].sysInventory;
                    skuSalePrice = skuObjectArr[i].salePrice;
                    shoppingCartSkuPic = skuObjectArr[i].skuPic;
                }
                if (selectColor === skuObjectArr[i].color && skuObjectArr[i].scale !== null) {
                    scaleCssArr[scaleIndexJson[skuObjectArr[i].scale]] = "";
                }
                if (selectScale === skuObjectArr[i].scale && skuObjectArr[i].color !== null) {
                    colorCssArr[colorIndexJson[skuObjectArr[i].color]] = "";
                }
            }
            colorCssArr[colorIndexJson[selectColor]] = "active";
            scaleCssArr[scaleIndexJson[selectScale]] = "active";
        } else if (selectColor !== null && selectScale === null) { //选中颜色，无尺寸
            selectSkuId = null;
            for (let i = 0; i < colorList.length; i++) {
                colorCssArr[i] = "";
            }
            for (let i = 0; i < scaleList.length; i++) {
                scaleCssArr[i] = "unavailable";
            }
            for (let i = 0; i < skuObjectArr.length; i++) {
                if (selectColor === skuObjectArr[i].color && skuObjectArr[i].scale !== null) {
                    scaleCssArr[scaleIndexJson[skuObjectArr[i].scale]] = "";
                    skuInventory += skuObjectArr[i].sysInventory;
                    shoppingCartSkuPic = skuObjectArr[i].skuPic;
                }
                if (selectColor == skuObjectArr[i].color && selectScale == skuObjectArr[i].scale) {
                    selectSkuId = skuObjectArr[i].skuId;
                    skuInventory = skuObjectArr[i].sysInventory;
                    skuSalePrice = skuObjectArr[i].salePrice;
                    shoppingCartSkuPic = skuObjectArr[i].skuPic;
                    break;
                }
            }
            colorCssArr[colorIndexJson[selectColor]] = "active";
        } else if (selectColor === null && selectScale !== null) { //选中尺寸，无颜色
            selectSkuId = null;
            for (let i = 0; i < colorList.length; i++) {
                colorCssArr[i] = "unavailable";
            }
            for (let i = 0; i < scaleList.length; i++) {
                scaleCssArr[i] = "";
            }
            for (let i = 0; i < skuObjectArr.length; i++) {
                if (selectScale === skuObjectArr[i].scale && skuObjectArr[i].color !== null) {
                    colorCssArr[colorIndexJson[skuObjectArr[i].color]] = "";
                    skuInventory += skuObjectArr[i].sysInventory;
                }
                if (selectColor == skuObjectArr[i].color && selectScale == skuObjectArr[i].scale) {
                    selectSkuId = skuObjectArr[i].skuId;
                    skuInventory = skuObjectArr[i].sysInventory;
                    skuSalePrice = skuObjectArr[i].salePrice;
                    shoppingCartSkuPic = skuObjectArr[i].skuPic;
                    break;
                }
            }
            scaleCssArr[scaleIndexJson[selectScale]] = "active";
        } else { //都没选中
            selectSkuId = null;
            for (let i = 0; i < colorList.length; i++) {
                colorCssArr[i] = "";
            }
            for (let i = 0; i < scaleList.length; i++) {
                scaleCssArr[i] = "";
            }
            skuInventory = this.data.totalSysInventory;
        }
        //console.log(selectColor + "-" + selectScale + "-" + selectSkuId + "-" + shoppingCartSkuPic);
        this.setData({
            colorCssArr: colorCssArr,
            scaleCssArr: scaleCssArr,
            selectColor: selectColor,
            selectScale: selectScale,
            selectSkuId: selectSkuId,
            skuInventory: skuInventory,
            skuSalePrice: skuSalePrice,
            shoppingCartSkuPic: shoppingCartSkuPic
        });
        if (selectSkuId != null) {
            this.setData({
                buyNum: 1,
                reduceBuyNumCss: 'noClick',
                addBuyNumCss: 'canClick'
            });
        }

        if (this.data.buyNum >= this.data.skuInventory) {
            this.setData({
                buyNum: this.data.skuInventory,
                reduceBuyNumCss: 'canClick',
                addBuyNumCss: 'noClick'
            });
        } else if (this.data.buyNum < this.data.skuInventory) {
            this.setData({
                addBuyNumCss: 'canClick'
            });
        }
    },
    toBuy: function(e) {
        if (!e.currentTarget.dataset.selectskuid) return;
        let that = this;
        let selectSkuId = e.currentTarget.dataset.selectskuid;
        let skuList = new Array();
        let skuInfo = {};
        skuInfo.skuId = selectSkuId;
        skuInfo.quantity = that.data.buyNum;
        skuList.push(skuInfo);
        wx.navigateTo({
            url: '/pages/shopCarts/account/account?skuListStr=' + JSON.stringify(skuList)
        })
    },
    addShoppingCart: function(e) {
        if (!e.currentTarget.dataset.selectskuid) return;
        let that = this;

        let parame = {};
        parame.openId = app.globalData.xcxCookieId;
        parame.skuId = e.currentTarget.dataset.selectskuid;
        parame.quantity = that.data.buyNum;

        //console.log(parame);
        that.hideModal();
        wx.request({
            url: app.globalData.apiUrl + '/api/wx/shoppingCart/addToShoppingCart',
            data: parame,
            header: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            success: function(res) {
                wx.showToast({
                    title: '已成功添加到购物车',
                    icon: 'none',
                    duration: 2500
                })
            }
        });
    },
    gotoGoodsList: function() {
        wx.switchTab({
            url: '/pages/index/index',
        })
    },
    //隐藏弹框
    hideModalbBargain: function() {
        this.setData({
            bargainStatus: false,
        });
    },
    //隐藏弹框
    hideFriend: function() {
        this.setData({
            FriendStatus: false,
        });
    },
    //加入购物车或者购买提示
    showAddTip: function(e) {
        let that = this;
        wx.showToast({
            title: '请先选择颜色或者尺码',
            icon: 'none',
            duration: 2500,
        })
    },
    timeFormat(param) { //小于10的格式化函数
        return param < 10 ? '0' + param : param;
    },
    // 监听滑动
    onPageScroll: function(e) {
        let that = this;
        if (e.scrollTop > 300) {
            that.setData({
                chooseIndex: 1
            })
        } else {
            that.setData({
                chooseIndex: 0
            })
        }
    },
    shopCart() {
        wx.switchTab({
            url: '/pages/shopCarts/shopCarts'
        })
    }
})
// 三种分类跳转到相应的位置
function goToPage(scrollTop) {
    let that = this;
    wx.pageScrollTo({
        scrollTop: scrollTop,
        duration: 300
    })
}
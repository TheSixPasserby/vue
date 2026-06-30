import { defineStore } from "pinia"
import { ref } from "vue"

// 定义HomepageMenu中元素的二级标题类型
export interface MenuItemSecondaryTitle{
    id: string,
    title: string,
    path: string,
    data?: string
}

// 定义homepageMenu中元素的类型
export interface HomepageMenuItem{
    id: number,
    title: string,
    children?: MenuItemSecondaryTitle[]
}

// 创建仓库
export const useMenusStore = defineStore("menus", ()=>{
    // 仓库中存放的数据和方法
    const homepageMenu = ref<HomepageMenuItem[]>([])
    function updateMenu(menu: HomepageMenuItem[]){
        // 用于将后端服务器传来的菜单栏数据付给仓库中的homepageMenu
        homepageMenu.value = menu
    }
    return{
        homepageMenu,
        updateMenu
    }
})
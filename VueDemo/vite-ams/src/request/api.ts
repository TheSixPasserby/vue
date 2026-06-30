import request from "./request";
import type { HomepageMenuItem } from "../store/menus";

// ==================== 类型定义 ====================

interface LoginData {
  username: string;
  psw: string;
}

interface LoginRes {
  code: number;
  message: string;
  user: {
    username: string;
    role: string;
  };
  token: string;
}

interface MenuRes {
  code: number;
  message: string;
  menus: HomepageMenuItem[];
}

interface DashboardStatsRes {
  code: number;
  data: {
    totalCrops: number;
    totalArea: number;
    totalYield: number;
    totalSupplies: number;
    activeFields: number;
    totalFields: number;
    cropYieldData: { name: string; yield: number; area: number }[];
    weatherTrend: { date: string; temperature: number; humidity: number; rainfall: number }[];
  };
}

export interface CropItem {
  id: number;
  name: string;
  type: string;
  area: number;
  yield: number;
  plantDate: string;
  status: string;
  location: string;
}

export interface FieldItem {
  id: number;
  name: string;
  area: number;
  soilType: string;
  location: string;
  irrigation: string;
  status: string;
}

export interface WeatherItem {
  id: number;
  date: string;
  temperature: number;
  humidity: number;
  rainfall: number;
  windSpeed: number;
  location: string;
}

export interface SupplyItem {
  id: number;
  name: string;
  type: string;
  stock: number;
  unit: string;
  supplier: string;
  price: number;
}

export interface UserItem {
  id: number;
  username: string;
  role: string;
  phone: string;
  status: string;
}

interface ListRes<T> {
  code: number;
  data: T[];
  total: number;
}

interface ActionRes<T> {
  code: number;
  message: string;
  data?: T;
}

// ==================== 认证接口 ====================

export const loginApi = (data: LoginData): Promise<LoginRes> => {
  return request.post("/api/auth/login", data);
};

export const getUserMenusApi = (): Promise<MenuRes> => {
  return request.get("/api/user/menus");
};

// ==================== 仪表盘接口 ====================

export const getDashboardStatsApi = (): Promise<DashboardStatsRes> => {
  return request.get("/api/dashboard/stats");
};

// ==================== 作物管理接口 ====================

export const getCropsApi = (params?: { keyword?: string; type?: string; status?: string }): Promise<ListRes<CropItem>> => {
  return request.get("/api/crops", { params });
};

export const addCropApi = (data: Partial<CropItem>): Promise<ActionRes<CropItem>> => {
  return request.post("/api/crops", data);
};

export const updateCropApi = (id: number, data: Partial<CropItem>): Promise<ActionRes<CropItem>> => {
  return request.put(`/api/crops/${id}`, data);
};

export const deleteCropApi = (id: number): Promise<ActionRes<null>> => {
  return request.delete(`/api/crops/${id}`);
};

// ==================== 农田管理接口 ====================

export const getFieldsApi = (params?: { keyword?: string; soilType?: string; status?: string }): Promise<ListRes<FieldItem>> => {
  return request.get("/api/fields", { params });
};

export const addFieldApi = (data: Partial<FieldItem>): Promise<ActionRes<FieldItem>> => {
  return request.post("/api/fields", data);
};

export const updateFieldApi = (id: number, data: Partial<FieldItem>): Promise<ActionRes<FieldItem>> => {
  return request.put(`/api/fields/${id}`, data);
};

export const deleteFieldApi = (id: number): Promise<ActionRes<null>> => {
  return request.delete(`/api/fields/${id}`);
};

// ==================== 气象数据接口 ====================

export const getWeatherApi = (params?: { startDate?: string; endDate?: string }): Promise<ListRes<WeatherItem>> => {
  return request.get("/api/weather", { params });
};

export const addWeatherApi = (data: Partial<WeatherItem>): Promise<ActionRes<WeatherItem>> => {
  return request.post("/api/weather", data);
};

export const updateWeatherApi = (id: number, data: Partial<WeatherItem>): Promise<ActionRes<WeatherItem>> => {
  return request.put(`/api/weather/${id}`, data);
};

export const deleteWeatherApi = (id: number): Promise<ActionRes<null>> => {
  return request.delete(`/api/weather/${id}`);
};

// ==================== 农资管理接口 ====================

export const getSuppliesApi = (params?: { keyword?: string; type?: string }): Promise<ListRes<SupplyItem>> => {
  return request.get("/api/supplies", { params });
};

export const addSupplyApi = (data: Partial<SupplyItem>): Promise<ActionRes<SupplyItem>> => {
  return request.post("/api/supplies", data);
};

export const updateSupplyApi = (id: number, data: Partial<SupplyItem>): Promise<ActionRes<SupplyItem>> => {
  return request.put(`/api/supplies/${id}`, data);
};

export const deleteSupplyApi = (id: number): Promise<ActionRes<null>> => {
  return request.delete(`/api/supplies/${id}`);
};

// ==================== 用户管理接口 ====================

export const getUsersApi = (params?: { keyword?: string; role?: string; status?: string }): Promise<ListRes<UserItem>> => {
  return request.get("/api/users", { params });
};

export const addUserApi = (data: Partial<UserItem> & { psw: string }): Promise<ActionRes<UserItem>> => {
  return request.post("/api/users", data);
};

export const updateUserApi = (id: number, data: Partial<UserItem>): Promise<ActionRes<UserItem>> => {
  return request.put(`/api/users/${id}`, data);
};

export const deleteUserApi = (id: number): Promise<ActionRes<null>> => {
  return request.delete(`/api/users/${id}`);
};

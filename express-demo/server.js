require("dotenv").config();
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.JWT_SECRET;

if (!SECRET_KEY) {
  console.error("错误: 未设置 JWT_SECRET 环境变量");
  process.exit(1);
}

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==================== 密码哈希工具 ====================

const hashPassword = (password) => bcrypt.hashSync(password, 10);
const comparePassword = (password, hash) => bcrypt.compareSync(password, hash);

// ==================== Mock 数据库（密码已哈希）====================

let users = [
  { id: 1, username: "admin", psw: hashPassword("111111"), role: "管理员", phone: "13800138001", status: "启用" },
  { id: 2, username: "张三", psw: hashPassword("222222"), role: "普通用户", phone: "13800138002", status: "启用" },
  { id: 3, username: "李四", psw: hashPassword("333333"), role: "普通用户", phone: "13800138003", status: "禁用" },
];

let crops = [
  { id: 1, name: "水稻", type: "粮食作物", area: 1200, yield: 7800, plantDate: "2026-03-15", status: "生长中", location: "A区" },
  { id: 2, name: "小麦", type: "粮食作物", area: 800, yield: 4500, plantDate: "2025-10-20", status: "已收割", location: "B区" },
  { id: 3, name: "玉米", type: "粮食作物", area: 1500, yield: 9200, plantDate: "2026-04-01", status: "生长中", location: "C区" },
  { id: 4, name: "大豆", type: "经济作物", area: 600, yield: 1800, plantDate: "2026-04-10", status: "生长中", location: "A区" },
  { id: 5, name: "棉花", type: "经济作物", area: 900, yield: 2700, plantDate: "2026-03-25", status: "生长中", location: "D区" },
  { id: 6, name: "油菜", type: "经济作物", area: 450, yield: 1200, plantDate: "2025-10-05", status: "已收割", location: "B区" },
];

let fields = [
  { id: 1, name: "A区-1号地", area: 500, soilType: "壤土", location: "东经116.4° 北纬39.9°", irrigation: "滴灌", status: "使用中" },
  { id: 2, name: "A区-2号地", area: 700, soilType: "黏土", location: "东经116.5° 北纬39.9°", irrigation: "喷灌", status: "使用中" },
  { id: 3, name: "B区-1号地", area: 800, soilType: "砂土", location: "东经116.4° 北纬40.0°", irrigation: "漫灌", status: "使用中" },
  { id: 4, name: "C区-1号地", area: 1500, soilType: "壤土", location: "东经116.6° 北纬39.8°", irrigation: "滴灌", status: "使用中" },
  { id: 5, name: "D区-1号地", area: 900, soilType: "黏土", location: "东经116.5° 北纬40.1°", irrigation: "喷灌", status: "闲置" },
];

let weatherData = [
  { id: 1, date: "2026-06-01", temperature: 28, humidity: 65, rainfall: 12, windSpeed: 3.2, location: "A区" },
  { id: 2, date: "2026-06-02", temperature: 30, humidity: 60, rainfall: 0, windSpeed: 2.8, location: "A区" },
  { id: 3, date: "2026-06-03", temperature: 32, humidity: 55, rainfall: 0, windSpeed: 4.1, location: "A区" },
  { id: 4, date: "2026-06-04", temperature: 27, humidity: 75, rainfall: 25, windSpeed: 5.6, location: "A区" },
  { id: 5, date: "2026-06-05", temperature: 25, humidity: 80, rainfall: 18, windSpeed: 3.8, location: "A区" },
  { id: 6, date: "2026-06-06", temperature: 29, humidity: 62, rainfall: 5, windSpeed: 2.5, location: "A区" },
  { id: 7, date: "2026-06-07", temperature: 31, humidity: 58, rainfall: 0, windSpeed: 3.0, location: "A区" },
];

let supplies = [
  { id: 1, name: "复合肥", type: "化肥", stock: 5000, unit: "kg", supplier: "金正大集团", price: 2800 },
  { id: 2, name: "尿素", type: "化肥", stock: 3000, unit: "kg", supplier: "中化化肥", price: 1800 },
  { id: 3, name: "吡虫啉", type: "农药", stock: 200, unit: "L", supplier: "先正达", price: 150 },
  { id: 4, name: "水稻种子-南粳", type: "种子", stock: 800, unit: "kg", supplier: "隆平高科", price: 45 },
  { id: 5, name: "地膜", type: "农资", stock: 1000, unit: "卷", supplier: "大禹节水", price: 85 },
  { id: 6, name: "有机肥", type: "化肥", stock: 8000, unit: "kg", supplier: "根力多", price: 1200 },
];

let nextId = 100;
const getNextId = () => ++nextId;

// ==================== 菜单数据 ====================

const menusByRole = {
  管理员: [
    {
      id: 1,
      title: "数据中心",
      children: [{ id: "1-1", title: "系统仪表盘", path: "/homepage/dashboard" }],
    },
    {
      id: 2,
      title: "农业生产",
      children: [
        { id: "2-1", title: "作物管理", path: "/homepage/crops" },
        { id: "2-2", title: "农田管理", path: "/homepage/fields" },
      ],
    },
    {
      id: 3,
      title: "数据监测",
      children: [{ id: "3-1", title: "气象数据", path: "/homepage/weather" }],
    },
    {
      id: 4,
      title: "资源管理",
      children: [{ id: "4-1", title: "农资管理", path: "/homepage/supplies" }],
    },
    {
      id: 5,
      title: "系统管理",
      children: [{ id: "5-1", title: "用户管理", path: "/homepage/users" }],
    },
  ],
  普通用户: [
    {
      id: 1,
      title: "数据中心",
      children: [{ id: "1-1", title: "系统仪表盘", path: "/homepage/dashboard" }],
    },
    {
      id: 2,
      title: "农业生产",
      children: [
        { id: "2-1", title: "作物管理", path: "/homepage/crops" },
        { id: "2-2", title: "农田管理", path: "/homepage/fields" },
      ],
    },
    {
      id: 3,
      title: "数据监测",
      children: [{ id: "3-1", title: "气象数据", path: "/homepage/weather" }],
    },
  ],
};

// ==================== 中间件 ====================

const generateToken = (user) => {
  return jwt.sign({ username: user.username, role: user.role }, SECRET_KEY, { expiresIn: "12h" });
};

const authenticate = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) return res.status(401).json({ code: 401, message: "未提供认证令牌" });

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ code: 401, message: "令牌无效或已过期" });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ code: 403, message: "权限不足，需要管理员权限" });
    }
    next();
  };
};

// ==================== 登录接口（统一）====================

app.post("/api/auth/login", (req, res) => {
  const { username, psw } = req.body;

  if (!username || !psw) {
    return res.status(400).json({ code: 400, message: "用户名和密码不能为空" });
  }

  const user = users.find((u) => u.username === username);
  if (!user) {
    return res.status(401).json({ code: 401, message: "用户名或密码错误" });
  }

  if (user.status === "禁用") {
    return res.status(403).json({ code: 403, message: "账号已被禁用" });
  }

  if (!comparePassword(psw, user.psw)) {
    return res.status(401).json({ code: 401, message: "用户名或密码错误" });
  }

  const token = generateToken(user);
  res.json({
    code: 200,
    message: "登录成功",
    user: { username: user.username, role: user.role },
    token,
  });
});

// ==================== 用户菜单接口 ====================

app.get("/api/user/menus", authenticate, (req, res) => {
  const menus = menusByRole[req.user.role] || [];
  res.json({ code: 200, message: "操作成功", menus });
});

// ==================== 仪表盘接口 ====================

app.get("/api/dashboard/stats", authenticate, (req, res) => {
  const totalCrops = crops.length;
  const totalArea = fields.reduce((sum, f) => sum + f.area, 0);
  const totalYield = crops.reduce((sum, c) => sum + c.yield, 0);
  const totalSupplies = supplies.length;
  const activeFields = fields.filter((f) => f.status === "使用中").length;

  res.json({
    code: 200,
    data: {
      totalCrops,
      totalArea,
      totalYield,
      totalSupplies,
      activeFields,
      totalFields: fields.length,
      cropYieldData: crops.map((c) => ({ name: c.name, yield: c.yield, area: c.area })),
      weatherTrend: weatherData.map((w) => ({
        date: w.date,
        temperature: w.temperature,
        humidity: w.humidity,
        rainfall: w.rainfall,
      })),
    },
  });
});

// ==================== 作物管理 CRUD ====================

app.get("/api/crops", authenticate, (req, res) => {
  const { keyword, type, status } = req.query;
  let result = [...crops];
  if (keyword) result = result.filter((c) => c.name.includes(keyword));
  if (type) result = result.filter((c) => c.type === type);
  if (status) result = result.filter((c) => c.status === status);
  res.json({ code: 200, data: result, total: result.length });
});

app.post("/api/crops", authenticate, (req, res) => {
  const crop = { id: getNextId(), ...req.body };
  crops.push(crop);
  res.json({ code: 200, message: "添加成功", data: crop });
});

app.put("/api/crops/:id", authenticate, (req, res) => {
  const id = parseInt(req.params.id);
  const index = crops.findIndex((c) => c.id === id);
  if (index === -1) return res.status(404).json({ code: 404, message: "作物不存在" });

  crops[index] = { ...crops[index], ...req.body };
  res.json({ code: 200, message: "更新成功", data: crops[index] });
});

app.delete("/api/crops/:id", authenticate, (req, res) => {
  const id = parseInt(req.params.id);
  const index = crops.findIndex((c) => c.id === id);
  if (index === -1) return res.status(404).json({ code: 404, message: "作物不存在" });

  crops.splice(index, 1);
  res.json({ code: 200, message: "删除成功" });
});

// ==================== 农田管理 CRUD ====================

app.get("/api/fields", authenticate, (req, res) => {
  const { keyword, soilType, status } = req.query;
  let result = [...fields];
  if (keyword) result = result.filter((f) => f.name.includes(keyword));
  if (soilType) result = result.filter((f) => f.soilType === soilType);
  if (status) result = result.filter((f) => f.status === status);
  res.json({ code: 200, data: result, total: result.length });
});

app.post("/api/fields", authenticate, (req, res) => {
  const field = { id: getNextId(), ...req.body };
  fields.push(field);
  res.json({ code: 200, message: "添加成功", data: field });
});

app.put("/api/fields/:id", authenticate, (req, res) => {
  const id = parseInt(req.params.id);
  const index = fields.findIndex((f) => f.id === id);
  if (index === -1) return res.status(404).json({ code: 404, message: "农田不存在" });

  fields[index] = { ...fields[index], ...req.body };
  res.json({ code: 200, message: "更新成功", data: fields[index] });
});

app.delete("/api/fields/:id", authenticate, (req, res) => {
  const id = parseInt(req.params.id);
  const index = fields.findIndex((f) => f.id === id);
  if (index === -1) return res.status(404).json({ code: 404, message: "农田不存在" });

  fields.splice(index, 1);
  res.json({ code: 200, message: "删除成功" });
});

// ==================== 气象数据 CRUD ====================

app.get("/api/weather", authenticate, (req, res) => {
  const { startDate, endDate } = req.query;
  let result = [...weatherData];
  if (startDate) result = result.filter((w) => w.date >= startDate);
  if (endDate) result = result.filter((w) => w.date <= endDate);
  res.json({ code: 200, data: result, total: result.length });
});

app.post("/api/weather", authenticate, (req, res) => {
  const record = { id: getNextId(), ...req.body };
  weatherData.push(record);
  res.json({ code: 200, message: "添加成功", data: record });
});

app.put("/api/weather/:id", authenticate, (req, res) => {
  const id = parseInt(req.params.id);
  const index = weatherData.findIndex((w) => w.id === id);
  if (index === -1) return res.status(404).json({ code: 404, message: "记录不存在" });

  weatherData[index] = { ...weatherData[index], ...req.body };
  res.json({ code: 200, message: "更新成功", data: weatherData[index] });
});

app.delete("/api/weather/:id", authenticate, (req, res) => {
  const id = parseInt(req.params.id);
  const index = weatherData.findIndex((w) => w.id === id);
  if (index === -1) return res.status(404).json({ code: 404, message: "记录不存在" });

  weatherData.splice(index, 1);
  res.json({ code: 200, message: "删除成功" });
});

// ==================== 农资管理 CRUD ====================

app.get("/api/supplies", authenticate, (req, res) => {
  const { keyword, type } = req.query;
  let result = [...supplies];
  if (keyword) result = result.filter((s) => s.name.includes(keyword));
  if (type) result = result.filter((s) => s.type === type);
  res.json({ code: 200, data: result, total: result.length });
});

app.post("/api/supplies", authenticate, authorize("管理员"), (req, res) => {
  const supply = { id: getNextId(), ...req.body };
  supplies.push(supply);
  res.json({ code: 200, message: "添加成功", data: supply });
});

app.put("/api/supplies/:id", authenticate, authorize("管理员"), (req, res) => {
  const id = parseInt(req.params.id);
  const index = supplies.findIndex((s) => s.id === id);
  if (index === -1) return res.status(404).json({ code: 404, message: "农资不存在" });

  supplies[index] = { ...supplies[index], ...req.body };
  res.json({ code: 200, message: "更新成功", data: supplies[index] });
});

app.delete("/api/supplies/:id", authenticate, authorize("管理员"), (req, res) => {
  const id = parseInt(req.params.id);
  const index = supplies.findIndex((s) => s.id === id);
  if (index === -1) return res.status(404).json({ code: 404, message: "农资不存在" });

  supplies.splice(index, 1);
  res.json({ code: 200, message: "删除成功" });
});

// ==================== 用户管理 CRUD（仅管理员）====================

app.get("/api/users", authenticate, authorize("管理员"), (req, res) => {
  const { keyword, role, status } = req.query;
  let result = users.map(({ psw, ...rest }) => rest);
  if (keyword) result = result.filter((u) => u.username.includes(keyword));
  if (role) result = result.filter((u) => u.role === role);
  if (status) result = result.filter((u) => u.status === status);
  res.json({ code: 200, data: result, total: result.length });
});

app.post("/api/users", authenticate, authorize("管理员"), (req, res) => {
  const { username, psw, role, phone } = req.body;

  if (!username || !psw) {
    return res.status(400).json({ code: 400, message: "用户名和密码不能为空" });
  }

  if (users.find((u) => u.username === username)) {
    return res.status(400).json({ code: 400, message: "用户名已存在" });
  }

  const user = {
    id: getNextId(),
    username,
    psw: hashPassword(psw),
    role: role || "普通用户",
    phone: phone || "",
    status: "启用",
  };
  users.push(user);

  const { psw: _, ...rest } = user;
  res.json({ code: 200, message: "添加成功", data: rest });
});

app.put("/api/users/:id", authenticate, authorize("管理员"), (req, res) => {
  const id = parseInt(req.params.id);
  const index = users.findIndex((u) => u.id === id);
  if (index === -1) return res.status(404).json({ code: 404, message: "用户不存在" });

  const { psw, ...updates } = req.body;
  if (psw) {
    updates.psw = hashPassword(psw);
  }
  users[index] = { ...users[index], ...updates };

  const { psw: _, ...rest } = users[index];
  res.json({ code: 200, message: "更新成功", data: rest });
});

app.delete("/api/users/:id", authenticate, authorize("管理员"), (req, res) => {
  const id = parseInt(req.params.id);
  const index = users.findIndex((u) => u.id === id);
  if (index === -1) return res.status(404).json({ code: 404, message: "用户不存在" });

  if (users[index].username === "admin") {
    return res.status(400).json({ code: 400, message: "不能删除管理员账号" });
  }

  users.splice(index, 1);
  res.json({ code: 200, message: "删除成功" });
});

// ==================== 启动服务器 ====================

app.listen(PORT, () => {
  console.log(`服务器启动到 ${PORT} 端口上了！`);
});

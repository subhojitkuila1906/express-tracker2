const STORAGE_KEYS = {
    users: "expenseUsers",
    currentUser: "expenseCurrentUser"
};

const DEMO_ADMIN = {
    name: "Expense Tracker Admin",
    username: "admin",
    email: "admin@expensetracker.com",
    phone: "",
    password: "admin123",
    role: "admin"
};

const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.users)) || [];
let currentUser = JSON.parse(localStorage.getItem(STORAGE_KEYS.currentUser));
let editingUserEmail = null;
let financeData = {
    transactions: [],
    transfers: [],
    savings: [],
    budgets: []
};

function ensureDemoAdmin() {
    if (users.some(user => user.email === DEMO_ADMIN.email)) return;

    users.push({
        ...DEMO_ADMIN,
        joinedAt: new Date().toISOString()
    });
    saveUsers();
}

function saveUsers() {
    localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
}

function getFinanceKey() {
    return currentUser ? `expenseTrackerData_${currentUser.email}` : "";
}

function createDemoData() {
    return {
        transactions: [
            { id: 1, description: "Salary", amount: 5000, type: "income", category: "Salary", date: "2026-09-01" },
            { id: 2, description: "Rent", amount: 1200, type: "expense", category: "Bills", date: "2026-09-02" },
            { id: 3, description: "Groceries", amount: 420, type: "expense", category: "Food", date: "2026-09-05" },
            { id: 4, description: "Freelance Project", amount: 700, type: "income", category: "Salary", date: "2026-09-10" }
        ],
        transfers: [
            { id: 1, from: "Main Account", to: "Savings", amount: 400, date: "2026-09-06" },
            { id: 2, from: "Main Account", to: "Travel Wallet", amount: 250, date: "2026-09-12" }
        ],
        savings: [
            { id: 1, name: "Emergency Fund", target: 20000, saved: 12500 },
            { id: 2, name: "Vacation", target: 8000, saved: 4300 }
        ],
        budgets: [
            { id: 1, category: "Food", limit: 1200, spent: 890 },
            { id: 2, category: "Travel", limit: 800, spent: 420 },
            { id: 3, category: "Bills", limit: 1500, spent: 1200 }
        ]
    };
}

function loadFinanceState() {
    if (!currentUser) {
        financeData = { transactions: [], transfers: [], savings: [], budgets: [] };
        return;
    }

    const key = getFinanceKey();
    const data = JSON.parse(localStorage.getItem(key));

    if (!data) {
        const demo = createDemoData();
        localStorage.setItem(key, JSON.stringify(demo));
        financeData = demo;
        return;
    }

    financeData = data;
}

function saveFinanceState() {
    if (!currentUser) return;
    localStorage.setItem(getFinanceKey(), JSON.stringify(financeData));
}

function setAuthMode(mode) {
    const isLogin = mode === "login";
    const isSignup = mode === "signup";
    const isReset = mode === "reset";
    const isAdminLogin = mode === "admin-login";

    document.getElementById("loginFormWrap").classList.toggle("active", isLogin);
    document.getElementById("signupFormWrap").classList.toggle("active", isSignup);
    document.getElementById("resetFormWrap").classList.toggle("active", isReset);
    document.getElementById("adminLoginFormWrap").classList.toggle("active", isAdminLogin);

    document.getElementById("showLoginBtn").classList.toggle("active", isLogin);
    document.getElementById("showSignupBtn").classList.toggle("active", isSignup);
    document.getElementById("showAdminLoginBtn").classList.toggle("active", isAdminLogin);
}

function updateProfilePanel() {
    const profilePanel = document.getElementById("profilePanel");
    if (!currentUser) {
        profilePanel.classList.add("hidden");
        return;
    }

    document.getElementById("profileName").textContent = currentUser.name || "-";
    document.getElementById("profileEmail").textContent = currentUser.email || "-";
    document.getElementById("profileUsername").textContent = currentUser.username || "-";
    document.getElementById("profilePhone").textContent = currentUser.phone || "-";
    document.getElementById("profileJoined").textContent = currentUser.joinedAt
        ? new Date(currentUser.joinedAt).toLocaleDateString()
        : "-";
}

function renderAppState() {
    const loggedIn = !!currentUser;
    const isAdmin = loggedIn && currentUser.role === "admin";
    document.getElementById("authScreen").classList.toggle("hidden", loggedIn);
    document.getElementById("appScreen").classList.toggle("hidden", !loggedIn);
    document.getElementById("userMenu").classList.toggle("hidden", !loggedIn);
    document.getElementById("showLoginBtn").classList.toggle("hidden", loggedIn);
    document.getElementById("showSignupBtn").classList.toggle("hidden", loggedIn);
    document.getElementById("showAdminLoginBtn").classList.toggle("hidden", loggedIn);
    document.getElementById("userAppShell").classList.toggle("hidden", isAdmin);
    document.getElementById("adminScreen").classList.toggle("hidden", !isAdmin);

    if (loggedIn) {
        if (isAdmin) {
            document.getElementById("adminWelcomeName").textContent = currentUser.name.split(" ")[0];
            renderAdminDashboard();
        } else {
            document.getElementById("welcomeName").textContent = currentUser.name.split(" ")[0];
            renderAll();
        }
        updateProfilePanel();
    } else {
        document.getElementById("profilePanel").classList.add("hidden");
    }
}

function showSection(sectionName) {
    document.querySelectorAll(".sidebar-btn").forEach(function(button) {
        button.classList.toggle("active", button.dataset.section === sectionName);
    });

    document.querySelectorAll(".content-section").forEach(function(section) {
        const visible = section.id === `section-${sectionName}`;
        section.classList.toggle("hidden", !visible);
    });
}

function registerUser(event) {
    event.preventDefault();

    const name = document.getElementById("signupName").value.trim();
    const username = document.getElementById("signupUsername").value.trim();
    const email = document.getElementById("signupEmail").value.trim().toLowerCase();
    const phone = document.getElementById("signupPhone").value.trim();
    const password = document.getElementById("signupPassword").value.trim();

    if (!name || !username || !email || !phone || !password) {
        alert("Please fill all sign-up fields!");
        return;
    }

    if (users.some(user => user.email === email)) {
        alert("An account with this email already exists.");
        return;
    }

    const newUser = {
        name,
        username,
        email,
        phone,
        password,
        role: "user",
        joinedAt: new Date().toISOString()
    };

    users.push(newUser);
    saveUsers();
    document.getElementById("signupForm").reset();
    setAuthMode("login");
    alert("Account created successfully. Please log in.");
}

function resetPassword(event) {
    event.preventDefault();

    const email = document.getElementById("resetEmail").value.trim().toLowerCase();
    const newPassword = document.getElementById("resetPassword").value.trim();

    if (!email || !newPassword) {
        alert("Please enter your email and a new password.");
        return;
    }

    const userIndex = users.findIndex(user => user.email === email);

    if (userIndex === -1) {
        alert("No account found with that email.");
        return;
    }

    users[userIndex].password = newPassword;
    saveUsers();
    document.getElementById("resetForm").reset();
    setAuthMode("login");
    alert("Password updated successfully. Please log in again.");
}

function loginUser(event) {
    event.preventDefault();

    const email = document.getElementById("loginEmail").value.trim().toLowerCase();
    const password = document.getElementById("loginPassword").value.trim();

    const foundUser = users.find(user => user.email === email && user.password === password);

    if (!foundUser) {
        alert("Invalid email or password.");
        return;
    }

    if (foundUser.role === "admin") {
        alert("Please use the administrator sign-in.");
        return;
    }

    currentUser = { ...foundUser, role: "user" };
    localStorage.setItem(STORAGE_KEYS.currentUser, JSON.stringify(currentUser));
    loadFinanceState();
    renderAppState();
    showSection("dashboard");
    document.getElementById("loginForm").reset();
}

function loginAdmin(event) {
    event.preventDefault();

    const email = document.getElementById("adminLoginEmail").value.trim().toLowerCase();
    const password = document.getElementById("adminLoginPassword").value;
    const foundAdmin = users.find(user =>
        user.email === email && user.password === password && user.role === "admin"
    );

    if (!foundAdmin) {
        alert("Invalid administrator email or password.");
        return;
    }

    currentUser = foundAdmin;
    localStorage.setItem(STORAGE_KEYS.currentUser, JSON.stringify(currentUser));
    renderAppState();
    document.getElementById("adminLoginForm").reset();
}

function logoutUser() {
    currentUser = null;
    localStorage.removeItem(STORAGE_KEYS.currentUser);
    document.getElementById("profilePanel").classList.add("hidden");
    renderAppState();
    setAuthMode("login");
}

function renderAdminDashboard() {
    const regularUsers = users.filter(user => user.role !== "admin");
    const today = new Date().toDateString();
    const latestUser = regularUsers
        .filter(user => user.joinedAt)
        .sort((a, b) => new Date(b.joinedAt) - new Date(a.joinedAt))[0];

    document.getElementById("adminUserCount").textContent = String(regularUsers.length);
    document.getElementById("adminTodayCount").textContent = String(
        regularUsers.filter(user => user.joinedAt && new Date(user.joinedAt).toDateString() === today).length
    );
    document.getElementById("adminLatestRegistration").textContent = latestUser
        ? new Date(latestUser.joinedAt).toLocaleDateString()
        : "-";

    const search = document.getElementById("adminUserSearch").value.trim().toLowerCase();
    const filteredUsers = regularUsers.filter(user =>
        [user.name, user.username, user.email, user.phone]
            .some(value => String(value || "").toLowerCase().includes(search))
    );
    const tableBody = document.getElementById("adminUserList");
    tableBody.replaceChildren();

    if (!filteredUsers.length) {
        const row = tableBody.insertRow();
        const cell = row.insertCell();
        cell.colSpan = 6;
        cell.className = "empty-users";
        cell.textContent = regularUsers.length ? "No users match your search." : "No registered users yet.";
        return;
    }

    filteredUsers.forEach(user => {
        const row = tableBody.insertRow();
        [user.name, user.username, user.email, user.phone || "-", user.joinedAt
            ? new Date(user.joinedAt).toLocaleDateString()
            : "-"].forEach(value => {
            row.insertCell().textContent = value || "-";
        });

        const actions = row.insertCell();
        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.className = "secondary-btn";
        editButton.dataset.action = "edit";
        editButton.dataset.email = user.email;
        editButton.textContent = "Edit";
        actions.appendChild(editButton);

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "delete-btn";
        deleteButton.dataset.action = "delete";
        deleteButton.dataset.email = user.email;
        deleteButton.textContent = "Delete";
        actions.appendChild(deleteButton);
    });
}

function resetAdminUserForm() {
    editingUserEmail = null;
    document.getElementById("adminUserForm").reset();
    document.getElementById("adminFormTitle").textContent = "Create user";
    document.getElementById("adminSaveUserBtn").textContent = "Create user";
    document.getElementById("adminPasswordField").classList.remove("hidden");
    document.getElementById("adminUserPassword").required = true;
    document.getElementById("adminPasswordHelp").textContent = "Set an initial password for the new account.";
    document.getElementById("adminCancelEditBtn").classList.add("hidden");
}

function editAdminUser(email) {
    const user = users.find(account => account.email === email && account.role !== "admin");
    if (!user) {
        alert("That user account could not be found.");
        return;
    }

    editingUserEmail = user.email;
    document.getElementById("adminUserName").value = user.name || "";
    document.getElementById("adminUserUsername").value = user.username || "";
    document.getElementById("adminUserEmail").value = user.email || "";
    document.getElementById("adminUserPhone").value = user.phone || "";
    document.getElementById("adminPasswordField").classList.add("hidden");
    document.getElementById("adminUserPassword").required = false;
    document.getElementById("adminFormTitle").textContent = "Edit user";
    document.getElementById("adminSaveUserBtn").textContent = "Save changes";
    document.getElementById("adminCancelEditBtn").classList.remove("hidden");
    document.getElementById("adminUserName").focus();
}

function saveAdminUser(event) {
    event.preventDefault();
    if (!currentUser || currentUser.role !== "admin") {
        alert("Administrator access is required to manage users.");
        return;
    }

    const name = document.getElementById("adminUserName").value.trim();
    const username = document.getElementById("adminUserUsername").value.trim();
    const email = document.getElementById("adminUserEmail").value.trim().toLowerCase();
    const phone = document.getElementById("adminUserPhone").value.trim();
    const password = editingUserEmail ? "" : document.getElementById("adminUserPassword").value;

    if (!name || !username || !email || !phone || (!editingUserEmail && !password)) {
        alert("Please complete all required user details.");
        return;
    }

    if (users.some(user => user.email === email && user.email !== editingUserEmail)) {
        alert("An account with this email already exists.");
        return;
    }

    if (editingUserEmail) {
        const user = users.find(account => account.email === editingUserEmail && account.role !== "admin");
        if (!user) {
            alert("That user account could not be found.");
            return;
        }
        const previousEmail = user.email;
        user.name = name;
        user.username = username;
        user.email = email;
        user.phone = phone;
        if (previousEmail !== email) {
            const previousFinanceKey = `expenseTrackerData_${previousEmail}`;
            const updatedFinanceKey = `expenseTrackerData_${email}`;
            const financeDataForUser = localStorage.getItem(previousFinanceKey);
            if (financeDataForUser !== null) {
                localStorage.setItem(updatedFinanceKey, financeDataForUser);
                localStorage.removeItem(previousFinanceKey);
            }
        }
    } else {
        users.push({
            name,
            username,
            email,
            phone,
            password,
            role: "user",
            joinedAt: new Date().toISOString()
        });
    }

    saveUsers();
    resetAdminUserForm();
    renderAdminDashboard();
}

function deleteAdminUser(email) {
    if (!currentUser || currentUser.role !== "admin") {
        alert("Administrator access is required to manage users.");
        return;
    }

    const userIndex = users.findIndex(user => user.email === email && user.role !== "admin");
    if (userIndex === -1) {
        alert("That user account could not be found.");
        return;
    }
    if (!confirm(`Delete the account for ${users[userIndex].name}? This also removes its locally stored finance data.`)) {
        return;
    }

    localStorage.removeItem(`expenseTrackerData_${users[userIndex].email}`);
    users.splice(userIndex, 1);
    saveUsers();
    if (editingUserEmail === email) resetAdminUserForm();
    renderAdminDashboard();
}

function addTransaction() {
    if (!currentUser) {
        alert("Please log in to add transactions.");
        return;
    }

    const description = document.getElementById("description").value.trim();
    const amount = document.getElementById("amount").value;
    const type = document.getElementById("type").value;
    const category = document.getElementById("category").value;
    const date = document.getElementById("date").value;

    if (!description || !amount || !date) {
        alert("Please fill all fields!");
        return;
    }

    financeData.transactions.push({
        id: Date.now(),
        description,
        amount: Number(amount),
        type,
        category,
        date
    });

    saveFinanceState();
    document.getElementById("description").value = "";
    document.getElementById("amount").value = "";
    document.getElementById("date").value = "";
    renderAll();
}

function deleteTransaction(id) {
    financeData.transactions = financeData.transactions.filter(transaction => transaction.id !== id);
    saveFinanceState();
    renderAll();
}

function addIncomeEntry() {
    const label = document.getElementById("incomeLabel").value.trim();
    const amount = Number(document.getElementById("incomeAmount").value);
    const date = document.getElementById("incomeDate").value;

    if (!label || !amount || !date) {
        alert("Please enter income source, amount, and date.");
        return;
    }

    financeData.transactions.push({
        id: Date.now(),
        description: label,
        amount,
        type: "income",
        category: "Salary",
        date
    });

    saveFinanceState();
    document.getElementById("incomeLabel").value = "";
    document.getElementById("incomeAmount").value = "";
    document.getElementById("incomeDate").value = "";
    renderAll();
}

function addExpenseEntry() {
    const label = document.getElementById("expenseLabel").value.trim();
    const amount = Number(document.getElementById("expenseAmount").value);
    const category = document.getElementById("expenseCategory").value;
    const date = document.getElementById("expenseDate").value;

    if (!label || !amount || !date) {
        alert("Please enter expense details.");
        return;
    }

    financeData.transactions.push({
        id: Date.now(),
        description: label,
        amount,
        type: "expense",
        category,
        date
    });

    saveFinanceState();
    document.getElementById("expenseLabel").value = "";
    document.getElementById("expenseAmount").value = "";
    document.getElementById("expenseDate").value = "";
    renderAll();
}

function addTransfer() {
    const from = document.getElementById("transferFrom").value.trim() || "Main Account";
    const to = document.getElementById("transferTo").value.trim() || "Savings";
    const amount = Number(document.getElementById("transferAmount").value);
    const date = document.getElementById("transferDate").value;

    if (!amount || !date) {
        alert("Please enter transfer details.");
        return;
    }

    financeData.transfers.push({
        id: Date.now(),
        from,
        to,
        amount,
        date
    });

    saveFinanceState();
    document.getElementById("transferFrom").value = "Main Account";
    document.getElementById("transferTo").value = "Savings";
    document.getElementById("transferAmount").value = "";
    document.getElementById("transferDate").value = "";
    renderAll();
}

function deleteTransfer(id) {
    financeData.transfers = financeData.transfers.filter(item => item.id !== id);
    saveFinanceState();
    renderAll();
}

function addSavingsGoal() {
    const name = document.getElementById("savingName").value.trim();
    const target = Number(document.getElementById("savingTarget").value);
    const saved = Number(document.getElementById("savingCurrent").value) || 0;

    if (!name || !target) {
        alert("Please fill goal name and target amount.");
        return;
    }

    financeData.savings.push({
        id: Date.now(),
        name,
        target,
        saved
    });

    saveFinanceState();
    document.getElementById("savingName").value = "";
    document.getElementById("savingTarget").value = "";
    document.getElementById("savingCurrent").value = "";
    renderAll();
}

function deleteSavingsGoal(id) {
    financeData.savings = financeData.savings.filter(item => item.id !== id);
    saveFinanceState();
    renderAll();
}

function addBudget() {
    const category = document.getElementById("budgetCategory").value;
    const limit = Number(document.getElementById("budgetLimit").value);

    if (!limit) {
        alert("Please enter a valid budget amount.");
        return;
    }

    const spent = financeData.transactions
        .filter(t => t.type === "expense" && t.category === category)
        .reduce((sum, item) => sum + item.amount, 0);

    financeData.budgets.push({
        id: Date.now(),
        category,
        limit,
        spent
    });

    saveFinanceState();
    document.getElementById("budgetLimit").value = "";
    renderAll();
}

function deleteBudget(id) {
    financeData.budgets = financeData.budgets.filter(item => item.id !== id);
    saveFinanceState();
    renderAll();
}

function renderDashboard() {
    const income = financeData.transactions.filter(t => t.type === "income").reduce((sum, item) => sum + item.amount, 0);
    const expense = financeData.transactions.filter(t => t.type === "expense").reduce((sum, item) => sum + item.amount, 0);

    document.getElementById("totalIncome").textContent = "₹" + income;
    document.getElementById("totalExpense").textContent = "₹" + expense;
    document.getElementById("balance").textContent = "₹" + (income - expense);

    renderDashboardCharts();
    renderTransactionHistory();
}

function createChartElement(name, attributes) {
    const element = document.createElementNS("http://www.w3.org/2000/svg", name);
    Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
    return element;
}

function formatChartAmount(amount) {
    return "₹" + Math.round(amount).toLocaleString();
}

function getRecentMonths() {
    const now = new Date();
    return Array.from({ length: 6 }, function(_, index) {
        const date = new Date(now.getFullYear(), now.getMonth() - 5 + index, 1);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        return {
            key,
            label: date.toLocaleDateString(undefined, { month: "short" }),
            income: 0,
            expense: 0
        };
    });
}

function renderMonthlyFinanceChart(months) {
    const svg = document.getElementById("monthlyFinanceChart");
    svg.replaceChildren();

    const plot = { left: 58, right: 618, top: 22, bottom: 238 };
    const series = [
        { key: "expense", color: "#e76f51" },
        { key: "savings", color: "#2a9d8f" }
    ];
    const values = months.flatMap(month => [month.expense, month.income - month.expense]);
    const minValue = Math.min(0, ...values);
    const maxValue = Math.max(0, ...values) || 100;
    const range = Math.max(1, maxValue - minValue);
    const yFor = value => plot.top + ((maxValue - value) / range) * (plot.bottom - plot.top);
    const xFor = index => plot.left + index * ((plot.right - plot.left) / (months.length - 1));
    const title = createChartElement("title", {});
    title.textContent = "Spending and savings over the last six months";
    svg.appendChild(title);

    for (let step = 0; step <= 4; step += 1) {
        const value = maxValue - (range * step / 4);
        const y = yFor(value);
        svg.appendChild(createChartElement("line", {
            x1: plot.left,
            x2: plot.right,
            y1: y,
            y2: y,
            class: "chart-grid-line"
        }));

        const label = createChartElement("text", {
            x: plot.left - 9,
            y: y + 4,
            "text-anchor": "end",
            class: "chart-axis-label"
        });
        label.textContent = formatChartAmount(value);
        svg.appendChild(label);
    }

    months.forEach((month, index) => {
        const label = createChartElement("text", {
            x: xFor(index),
            y: plot.bottom + 27,
            "text-anchor": "middle",
            class: "chart-axis-label"
        });
        label.textContent = month.label;
        svg.appendChild(label);
    });

    series.forEach(item => {
        const points = months.map((month, index) => ({
            x: xFor(index),
            y: yFor(item.key === "savings" ? month.income - month.expense : month.expense)
        }));
        const path = points.map((point, index) =>
            `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`
        ).join(" ");
        svg.appendChild(createChartElement("path", {
            d: path,
            fill: "none",
            stroke: item.color,
            "stroke-width": 3,
            "stroke-linecap": "round",
            "stroke-linejoin": "round"
        }));

        points.forEach(point => {
            svg.appendChild(createChartElement("circle", {
                cx: point.x,
                cy: point.y,
                r: 4,
                fill: item.color,
                stroke: "#fff",
                "stroke-width": 2
            }));
        });
    });

    const description = months.map(month =>
        `${month.label}: spending ${formatChartAmount(month.expense)}, saving ${formatChartAmount(month.income - month.expense)}`
    ).join("; ");
    svg.setAttribute("aria-label", `Monthly spending and savings. ${description}`);
}

function renderExpenseBreakdownChart(transactions) {
    const svg = document.getElementById("expenseBreakdownChart");
    const legend = document.getElementById("expenseBreakdownLegend");
    const colors = ["#4c8eda", "#78aee8", "#a4c8ef", "#2f6fb5", "#c4dcf5", "#5885bd", "#d6e7f8"];
    const categoryTotals = new Map();

    transactions.forEach(transaction => {
        const category = transaction.category || "Other";
        categoryTotals.set(category, (categoryTotals.get(category) || 0) + Number(transaction.amount || 0));
    });

    const categories = Array.from(categoryTotals, ([name, amount]) => ({ name, amount }))
        .sort((a, b) => b.amount - a.amount);
    const total = categories.reduce((sum, category) => sum + category.amount, 0);
    const radius = 82;
    const circumference = 2 * Math.PI * radius;
    let offset = 0;
    svg.replaceChildren();
    legend.replaceChildren();
    svg.appendChild(createChartElement("circle", {
        cx: 120,
        cy: 120,
        r: radius,
        fill: "none",
        stroke: "#edf2f7",
        "stroke-width": 30
    }));

    categories.forEach((category, index) => {
        const segment = total ? category.amount / total * circumference : 0;
        svg.appendChild(createChartElement("circle", {
            cx: 120,
            cy: 120,
            r: radius,
            fill: "none",
            stroke: colors[index % colors.length],
            "stroke-width": 30,
            "stroke-dasharray": `${segment} ${circumference - segment}`,
            "stroke-dashoffset": -offset,
            transform: "rotate(-90 120 120)"
        }));
        offset += segment;

        const row = document.createElement("div");
        row.className = "breakdown-legend-row";
        const marker = document.createElement("i");
        marker.className = "legend-dot";
        marker.style.backgroundColor = colors[index % colors.length];
        const label = document.createElement("span");
        label.textContent = category.name;
        const amount = document.createElement("strong");
        amount.textContent = `${formatChartAmount(category.amount)} · ${Math.round(category.amount / total * 100)}%`;
        row.append(marker, label, amount);
        legend.appendChild(row);
    });

    const totalLabel = createChartElement("text", {
        x: 120,
        y: 113,
        "text-anchor": "middle",
        class: "donut-total"
    });
    totalLabel.textContent = formatChartAmount(total);
    const caption = createChartElement("text", {
        x: 120,
        y: 137,
        "text-anchor": "middle",
        class: "donut-caption"
    });
    caption.textContent = "Total spent";
    svg.append(totalLabel, caption);
    svg.setAttribute(
        "aria-label",
        categories.length
            ? `This month, ${formatChartAmount(total)} spent. ` + categories.map(category =>
                `${category.name}: ${formatChartAmount(category.amount)}`
            ).join(", ")
            : "No expenses recorded this month."
    );

    if (!categories.length) {
        const emptyLabel = document.createElement("p");
        emptyLabel.className = "breakdown-empty";
        emptyLabel.textContent = "No expenses this month";
        legend.appendChild(emptyLabel);
    }
}

function renderDashboardCharts() {
    const months = getRecentMonths();
    const monthsByKey = new Map(months.map(month => [month.key, month]));
    const currentMonth = months[months.length - 1].key;
    const currentMonthExpenses = [];

    financeData.transactions.forEach(transaction => {
        if (!transaction.date || !Number.isFinite(Number(transaction.amount))) return;
        const month = monthsByKey.get(transaction.date.slice(0, 7));
        if (month && (transaction.type === "income" || transaction.type === "expense")) {
            month[transaction.type] += Number(transaction.amount);
        }
        if (transaction.type === "expense" && transaction.date.slice(0, 7) === currentMonth) {
            currentMonthExpenses.push(transaction);
        }
    });

    renderMonthlyFinanceChart(months);
    renderExpenseBreakdownChart(currentMonthExpenses);
}

function renderTransactionHistory() {
    const tableBody = document.getElementById("transactionList");
    if (!tableBody) return;

    tableBody.innerHTML = "";

    financeData.transactions.forEach(function(transaction) {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${transaction.description}</td>
            <td>${transaction.category}</td>
            <td class="${transaction.type}-row">${transaction.type}</td>
            <td class="${transaction.type}-row">₹${transaction.amount}</td>
            <td>${transaction.date}</td>
            <td>
                <button class="delete-btn" onclick="deleteTransaction(${transaction.id})">Delete</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function renderIncomeSection() {
    const incomeTransactions = financeData.transactions.filter(t => t.type === "income");
    const total = incomeTransactions.reduce((sum, item) => sum + item.amount, 0);
    document.getElementById("incomeSummary").textContent = "₹" + total;
    document.getElementById("averageIncome").textContent = "₹" + (incomeTransactions.length ? Math.round(total / incomeTransactions.length) : 0);

    const tableBody = document.getElementById("incomeList");
    if (!tableBody) return;

    tableBody.innerHTML = "";

    incomeTransactions.forEach(function(item) {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${item.description}</td>
            <td>₹${item.amount}</td>
            <td>${item.date}</td>
            <td><button class="delete-btn" onclick="deleteTransaction(${item.id})">Delete</button></td>
        `;
        tableBody.appendChild(row);
    });
}

function renderExpenseSection() {
    const expenseTransactions = financeData.transactions.filter(t => t.type === "expense");
    const total = expenseTransactions.reduce((sum, item) => sum + item.amount, 0);
    document.getElementById("expenseSummary").textContent = "₹" + total;

    const categoryTotals = {};
    expenseTransactions.forEach(item => {
        categoryTotals[item.category] = (categoryTotals[item.category] || 0) + item.amount;
    });

    let topCategory = "-";
    let topValue = 0;
    Object.entries(categoryTotals).forEach(([category, amount]) => {
        if (amount > topValue) {
            topCategory = category;
            topValue = amount;
        }
    });
    document.getElementById("topExpenseCategory").textContent = topCategory;

    const tableBody = document.getElementById("expenseList");
    if (!tableBody) return;

    tableBody.innerHTML = "";

    expenseTransactions.forEach(function(item) {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${item.description}</td>
            <td>${item.category}</td>
            <td>₹${item.amount}</td>
            <td>${item.date}</td>
            <td><button class="delete-btn" onclick="deleteTransaction(${item.id})">Delete</button></td>
        `;
        tableBody.appendChild(row);
    });
}

function renderTransfersSection() {
    const tableBody = document.getElementById("transferList");
    if (!tableBody) return;

    tableBody.innerHTML = "";

    financeData.transfers.forEach(function(item) {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${item.from}</td>
            <td>${item.to}</td>
            <td>₹${item.amount}</td>
            <td>${item.date}</td>
            <td><button class="delete-btn" onclick="deleteTransfer(${item.id})">Delete</button></td>
        `;
        tableBody.appendChild(row);
    });
}

function renderSavingsSection() {
    const container = document.getElementById("savingsList");
    if (!container) return;

    container.innerHTML = "";

    financeData.savings.forEach(function(item) {
        const progress = Math.min(100, Math.round((item.saved / item.target) * 100));
        const box = document.createElement("div");
        box.className = "panel-box";
        box.innerHTML = `
            <h3>${item.name}</h3>
            <p>Saved: ₹${item.saved} / ₹${item.target}</p>
            <div class="progress-box">
                <div class="progress-bar">
                    <div class="progress-fill" style="width:${progress}%"></div>
                </div>
            </div>
            <div class="inline-actions">
                <button class="delete-btn" onclick="deleteSavingsGoal(${item.id})">Delete</button>
            </div>
        `;
        container.appendChild(box);
    });
}

function renderBudgetsSection() {
    const container = document.getElementById("budgetList");
    if (!container) return;

    container.innerHTML = "";

    financeData.budgets.forEach(function(item) {
        const progress = Math.min(100, Math.round((item.spent / item.limit) * 100));
        const card = document.createElement("div");
        card.className = "panel-box";
        card.innerHTML = `
            <h3>${item.category}</h3>
            <p>Spent: ₹${item.spent} / ₹${item.limit}</p>
            <div class="progress-box">
                <div class="progress-bar">
                    <div class="progress-fill" style="width:${progress}%"></div>
                </div>
            </div>
            <div class="inline-actions">
                <button class="delete-btn" onclick="deleteBudget(${item.id})">Delete</button>
            </div>
        `;
        container.appendChild(card);
    });
}

function renderReports() {
    const totalIncome = financeData.transactions.filter(t => t.type === "income").reduce((sum, item) => sum + item.amount, 0);
    const totalExpense = financeData.transactions.filter(t => t.type === "expense").reduce((sum, item) => sum + item.amount, 0);
    const totalTransfers = financeData.transfers.reduce((sum, item) => sum + item.amount, 0);
    const totalSavings = financeData.savings.reduce((sum, item) => sum + item.saved, 0);

    document.getElementById("netBalanceReport").textContent = "₹" + (totalIncome - totalExpense);
    document.getElementById("monthlySavingsReport").textContent = "₹" + (totalIncome - totalExpense - totalTransfers);
    document.getElementById("reportIncomeValue").textContent = "₹" + totalIncome;
    document.getElementById("reportExpenseValue").textContent = "₹" + totalExpense;
    document.getElementById("reportTransferValue").textContent = "₹" + totalTransfers;
    document.getElementById("reportSavingsValue").textContent = "₹" + totalSavings;
}

function renderAll() {
    renderDashboard();
    renderIncomeSection();
    renderExpenseSection();
    renderTransfersSection();
    renderSavingsSection();
    renderBudgetsSection();
    renderReports();
}

document.querySelectorAll(".sidebar-btn").forEach(function(button) {
    button.addEventListener("click", function() {
        showSection(button.dataset.section);
    });
});

document.getElementById("showLoginBtn").addEventListener("click", function() {
    setAuthMode("login");
});

document.getElementById("showSignupBtn").addEventListener("click", function() {
    setAuthMode("signup");
});

document.getElementById("showAdminLoginBtn").addEventListener("click", function() {
    setAuthMode("admin-login");
});

document.querySelectorAll("[data-mode]").forEach(function(button) {
    button.addEventListener("click", function() {
        setAuthMode(button.dataset.mode);
    });
});

document.getElementById("signupForm").addEventListener("submit", registerUser);
document.getElementById("resetForm").addEventListener("submit", resetPassword);
document.getElementById("loginForm").addEventListener("submit", loginUser);
document.getElementById("adminLoginForm").addEventListener("submit", loginAdmin);
document.getElementById("adminUserForm").addEventListener("submit", saveAdminUser);
document.getElementById("adminCancelEditBtn").addEventListener("click", resetAdminUserForm);
document.getElementById("adminUserSearch").addEventListener("input", renderAdminDashboard);
document.getElementById("adminUserList").addEventListener("click", function(event) {
    const button = event.target.closest("button[data-action]");
    if (!button) return;

    if (button.dataset.action === "edit") {
        editAdminUser(button.dataset.email);
    } else if (button.dataset.action === "delete") {
        deleteAdminUser(button.dataset.email);
    }
});
document.getElementById("logoutBtn").addEventListener("click", logoutUser);
document.getElementById("profileToggle").addEventListener("click", function() {
    document.getElementById("profilePanel").classList.toggle("hidden");
});

ensureDemoAdmin();

if (currentUser) {
    const storedUser = users.find(user => user.email === currentUser.email);
    if (!storedUser) {
        currentUser = null;
        localStorage.removeItem(STORAGE_KEYS.currentUser);
    } else {
        currentUser = storedUser;
    }
}

if (currentUser && currentUser.role !== "admin") {
    loadFinanceState();
}

renderAppState();
setAuthMode("login");

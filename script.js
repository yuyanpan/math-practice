let currentQuestion = {};
let timeLeft = 600; // 10分钟（单位：秒）
let timerInterval;
let isPaused = false;

// 页面切换
function showHome() {
    document.getElementById("home").style.display = "block";
    document.getElementById("settings").style.display = "none";
    document.getElementById("practice").style.display = "none";
    document.getElementById("wrong-questions").style.display = "none";
    clearInterval(timerInterval);
}

function showSettings() {
    document.getElementById("home").style.display = "none";
    document.getElementById("settings").style.display = "block";
}

function showPractice() {
    document.getElementById("settings").style.display = "none";
    document.getElementById("practice").style.display = "block";
    startTimer();
    generateQuestion();
}

function showWrongQuestions() {
    document.getElementById("home").style.display = "none";
    document.getElementById("wrong-questions").style.display = "block";
    displayWrongQuestions();
}

// 开始练习
function startPractice() {
    const min = parseInt(document.getElementById("range-min").value) || 0;
    const max = parseInt(document.getElementById("range-max").value) || 100;
    if (min >= max) {
        alert("最小值必须小于最大值！");
        return;
    }
    timeLeft = 600;
    isPaused = false;
    document.getElementById("pause-btn").textContent = "暂停";
    showPractice();
}

// 生成题目
function generateQuestion() {
    const grade = document.getElementById("grade").value;
    const min = parseInt(document.getElementById("range-min").value) || 0;
    const max = parseInt(document.getElementById("range-max").value) || 100;
    const operator = document.getElementById("operator").value;

    // 确保最小值小于最大值
    const rangeMin = Math.min(min, max);
    const rangeMax = Math.max(min, max);

    let num1 = Math.floor(Math.random() * (rangeMax - rangeMin + 1)) + rangeMin;
    let num2 = Math.floor(Math.random() * (rangeMax - rangeMin + 1)) + rangeMin;
    let question, answer;

    switch (operator) {
        case "add":
            question = `${num1} + ${num2} = `;
            answer = num1 + num2;
            break;
        case "subtract":
            num1 = Math.max(num1, num2);
            num2 = Math.min(num1, num2);
            question = `${num1} - ${num2} = `;
            answer = num1 - num2;
            break;
        case "multiply":
            question = `${num1} × ${num2} = `;
            answer = num1 * num2;
            break;
        case "divide":
            num2 = num2 === 0 ? 1 : num2;
            num1 = num1 * num2;
            question = `${num1} ÷ ${num2} = `;
            answer = num1 / num2;
            break;
    }

    currentQuestion = { question, answer };
    document.getElementById("question").textContent = currentQuestion.question;
    document.getElementById("answer").value = "";
    document.getElementById("feedback").innerHTML = "";
}

// 提交答案
function submitAnswer() {
    const userAnswer = parseInt(document.getElementById("answer").value);
    const correctAnswer = currentQuestion.answer;

    if (userAnswer === correctAnswer) {
        document.getElementById("feedback").innerHTML = '<span class="smile">😊</span> 正确！';
        setTimeout(generateQuestion, 1000);
    } else {
        document.getElementById("feedback").textContent = `错误！正确答案是 ${correctAnswer}`;
        saveWrongQuestion(currentQuestion.question, userAnswer, correctAnswer);
        setTimeout(generateQuestion, 2000);
    }
}

// 保存错题
function saveWrongQuestion(question, userAnswer, correctAnswer) {
    let wrongQuestions = JSON.parse(localStorage.getItem("wrongQuestions")) || [];
    wrongQuestions.push({ question, userAnswer, correctAnswer });
    localStorage.setItem("wrongQuestions", JSON.stringify(wrongQuestions));
}

// 显示错题集
function displayWrongQuestions() {
    const wrongQuestions = JSON.parse(localStorage.getItem("wrongQuestions")) || [];
    const list = document.getElementById("wrong-list");
    list.innerHTML = "";
    if (wrongQuestions.length === 0) {
        list.innerHTML = "<li>暂无错题</li>";
    } else {
        wrongQuestions.forEach(item => {
            const li = document.createElement("li");
            li.textContent = `${item.question}${item.userAnswer} (正确答案: ${item.correctAnswer})`;
            list.appendChild(li);
        });
    }
}

// 清空错题集
function clearWrongQuestions() {
    if (confirm("确定要清空错题集吗？此操作不可恢复！")) {
        localStorage.removeItem("wrongQuestions");
        displayWrongQuestions();
    }
}

// 计时器
function startTimer() {
    timerInterval = setInterval(() => {
        if (!isPaused && timeLeft > 0) {
            timeLeft--;
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            document.getElementById("timer").textContent = `${minutes}:${seconds < 10 ? "0" + seconds : seconds}`;
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                alert("时间到！练习结束。");
                showHome();
            }
        }
    }, 1000);
}

// 暂停/继续计时器
function togglePause() {
    isPaused = !isPaused;
    document.getElementById("pause-btn").textContent = isPaused ? "继续" : "暂停";
}

// 初始化
showHome();
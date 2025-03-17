let currentQuestion = {};
let totalQuestions = 10; // 默认题目数
let completedQuestions = 0;
let correctAnswers = 0;
let consecutiveCorrect = 0; // 连续正确次数

// 页面切换
function showHome() {
    document.getElementById("home").style.display = "block";
    document.getElementById("settings").style.display = "none";
    document.getElementById("practice").style.display = "none";
    document.getElementById("wrong-questions").style.display = "none";
}

function showSettings() {
    document.getElementById("home").style.display = "none";
    document.getElementById("settings").style.display = "block";
}

function showPractice() {
    document.getElementById("settings").style.display = "none";
    document.getElementById("wrong-questions").style.display = "none";
    document.getElementById("practice").style.display = "block";
    generateQuestion(); // 确保显示时生成题目
}

function showWrongQuestions() {
    document.getElementById("home").style.display = "none";
    document.getElementById("practice").style.display = "none";
    document.getElementById("wrong-questions").style.display = "block";
    displayWrongQuestions();
}

// 开始练习
function startPractice() {
    const minInput = document.getElementById("range-min").value;
    const maxInput = document.getElementById("range-max").value;
    const min = minInput === "" ? 0 : parseInt(minInput);
    const max = maxInput === "" ? 100 : parseInt(maxInput);
    totalQuestions = parseInt(document.getElementById("question-count").value) || 10;

    if (isNaN(min) || isNaN(max) || min >= max) {
        alert("请确保输入有效的范围，最小值必须小于最大值！");
        return;
    }
    if (isNaN(totalQuestions) || totalQuestions < 1) {
        alert("题目数量必须为正整数！");
        return;
    }

    completedQuestions = 0;
    correctAnswers = 0;
    consecutiveCorrect = 0;
    updateProgress();
    showPractice();
}

// 生成题目并朗读
function generateQuestion() {
    const minInput = document.getElementById("range-min").value;
    const maxInput = document.getElementById("range-max").value;
    const min = minInput === "" ? 0 : parseInt(minInput);
    const max = maxInput === "" ? 100 : parseInt(maxInput);
    const operator = document.getElementById("operator").value;

    const rangeMin = Math.min(min, max);
    const rangeMax = Math.max(min, max);

    let num1 = Math.floor(Math.random() * (rangeMax - rangeMin + 1)) + rangeMin;
    let num2 = Math.floor(Math.random() * (rangeMax - rangeMin + 1)) + rangeMin;
    let question, answer;

    switch (operator) {
        case "add":
            question = `${num1} + ${num2} = `;
            answer = num1 + num2;
            speakQuestion(num1, num2, "加");
            break;
        case "subtract":
            num1 = Math.max(num1, num2);
            num2 = Math.min(num1, num2);
            question = `${num1} - ${num2} = `;
            answer = num1 - num2;
            speakQuestion(num1, num2, "减");
            break;
        case "multiply":
            question = `${num1} × ${num2} = `;
            answer = num1 * num2;
            speakQuestion(num1, num2, "乘");
            break;
        case "divide":
            num2 = num2 === 0 ? 1 : num2;
            num1 = num1 * num2;
            question = `${num1} ÷ ${num2} = `;
            answer = num1 / num2;
            speakQuestion(num1, num2, "除以");
            break;
        default:
            question = "题目生成错误";
            answer = 0;
            speak("题目生成错误");
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

    if (isNaN(userAnswer)) {
        document.getElementById("feedback").textContent = "请输入有效答案！";
        return;
    }

    completedQuestions++;
    if (userAnswer === correctAnswer) {
        correctAnswers++;
        consecutiveCorrect++;
        document.getElementById("feedback").innerHTML = '<span class="smile">😊</span> 正确！';
        speak("太棒了！");
        removeWrongQuestion(currentQuestion.question, correctAnswer);
        
        if (consecutiveCorrect >= 5) {
            triggerRewardAnimation();
            consecutiveCorrect = 0;
        }
        setTimeout(nextQuestion, 1000);
    } else {
        consecutiveCorrect = 0;
        document.getElementById("feedback").textContent = `错误！正确答案是 ${correctAnswer}`;
        saveWrongQuestion(currentQuestion.question, userAnswer, correctAnswer);
        setTimeout(nextQuestion, 2000);
    }
    updateProgress();
}

// 更新进度
function updateProgress() {
    const accuracy = completedQuestions === 0 ? 0 : Math.round((correctAnswers / completedQuestions) * 100);
    document.getElementById("progress").textContent = `${completedQuestions}/${totalQuestions} (正确率: ${accuracy}%)`;
}

// 下一题或结束
function nextQuestion() {
    if (completedQuestions >= totalQuestions) {
        alert(`练习结束！完成 ${totalQuestions} 题，正确 ${correctAnswers} 题，正确率 ${Math.round((correctAnswers / totalQuestions) * 100)}%`);
        showHome();
    } else {
        generateQuestion();
    }
}

// 触发奖励动画
function triggerRewardAnimation() {
    const rewardContainer = document.getElementById("reward-animation");
    rewardContainer.classList.remove("hidden");

    for (let i = 0; i < 10; i++) {
        const star = document.createElement("div");
        star.classList.add("star");
        star.textContent = "★";
        star.style.left = `${Math.random() * 100}%`;
        star.style.animationDelay = `${Math.random() * 0.5}s`;
        rewardContainer.appendChild(star);

        setTimeout(() => {
            star.remove();
        }, 1500);
    }

    setTimeout(() => {
        rewardContainer.classList.add("hidden");
    }, 2000);
}

// 保存错题
function saveWrongQuestion(question, userAnswer, correctAnswer) {
    let wrongQuestions = JSON.parse(localStorage.getItem("wrongQuestions")) || [];
    wrongQuestions.push({ question, userAnswer, correctAnswer });
    localStorage.setItem("wrongQuestions", JSON.stringify(wrongQuestions));
}

// 从错题集中移除答对的题目
function removeWrongQuestion(question, correctAnswer) {
    let wrongQuestions = JSON.parse(localStorage.getItem("wrongQuestions")) || [];
    wrongQuestions = wrongQuestions.filter(item => 
        !(item.question === question && item.correctAnswer === correctAnswer)
    );
    localStorage.setItem("wrongQuestions", JSON.stringify(wrongQuestions));
}

// 显示错题集并添加重新练习按钮
function displayWrongQuestions() {
    const wrongQuestions = JSON.parse(localStorage.getItem("wrongQuestions")) || [];
    const list = document.getElementById("wrong-list");
    list.innerHTML = "";
    if (wrongQuestions.length === 0) {
        list.innerHTML = "<li>暂无错题</li>";
    } else {
        wrongQuestions.forEach((item, index) => {
            const li = document.createElement("li");
            li.textContent = `${item.question}${item.userAnswer} (正确答案: ${item.correctAnswer})`;
            
            const retryButton = document.createElement("button");
            retryButton.textContent = "重新练习";
            retryButton.classList.add("retry-btn");
            retryButton.onclick = () => retryWrongQuestion(item);
            li.appendChild(retryButton);
            
            list.appendChild(li);
        });
    }
}

// 重新练习错题
function retryWrongQuestion(item) {
    totalQuestions = 1;
    completedQuestions = 0;
    correctAnswers = 0;
    consecutiveCorrect = 0;
    currentQuestion = { question: item.question, answer: item.correctAnswer };
    updateProgress();
    showPractice();
    document.getElementById("question").textContent = currentQuestion.question;
    document.getElementById("answer").value = "";
    document.getElementById("feedback").innerHTML = "";
    speakQuestionFromText(item.question); // 朗读错题
}

// 朗读题目
function speakQuestion(num1, num2, operator) {
    const text = `${num1} ${operator} ${num2} 等于多少`;
    speak(text);
}

// 从文本朗读题目（用于错题）
function speakQuestionFromText(questionText) {
    const text = questionText.replace(" = ", " 等于多少");
    speak(text);
}

// 使用 Web Speech API 朗读文本
function speak(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "zh-CN"; // 设置为中文
    utterance.rate = 1.0; // 语速
    utterance.pitch = 1.0; // 音调
    window.speechSynthesis.speak(utterance);
}

// 初始化
showHome();
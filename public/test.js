$(function () {
    var questionCounter = 0;
    var answersIndices = [];
    displayNext(questionCounter);
    $('#quiz').fadeTo("slow", 1);


    $('#next').on('click', function (e) {
        e.preventDefault();
        var choise = getChoise();
        if (isNaN(choise)) {
            alert("Выберете ответ");
        } else {
            answersIndices[questionCounter] = choise;
            questionCounter++;
            displayNext(questionCounter, answersIndices[questionCounter]);
        }
    });
    $('#prev').on('click', function (e) {
        e.preventDefault();
        answersIndices[questionCounter] = getChoise(questionCounter);
        questionCounter--;
        if(questionCounter==questions.length-1){
            $('#quiz').fadeTo("slow", 1); 
        }
        displayNext(questionCounter, answersIndices[questionCounter]);
    });
    $('#complete').on('click', function (e) {
        e.preventDefault();
        getResult(answersIndices);        
        $('#complete').hide();
        $('#prev').hide();
        $('#start').show();
    });
    $('#start').on('click', function (e) {
        e.preventDefault();
        questionCounter = 0;
        answersIndices = [];
        displayNext(questionCounter);
        $('#hr').show();
        $('#quiz').fadeTo("slow", 1);
        $('#title h1').text("Выберете правильный ответ");
        $('#start').hide();
        $('#next').show();
    });
});

function displayNext(index, answer) {
    if (index < questions.length) {        
        setQuestion(index, answer);      
        
        if (index === 1) {
            $('#prev').show();
        } else if (index === 0) {
            $('#prev').hide();
            $('#next').show();
        } else {
            $('#next').show();
            $('#prev').show();
            $('#complete').hide();
        }
    } else {
        $('#next').hide();
        $('#quiz').hide();
        $('#complete').show();
    }
}


function setQuestion(index, answer) {    
    var p = $('#question');
    var form = $('#list');
    form.fadeTo("fast", 0);
    p.fadeOut(function () {
        $('#question p').text('Вопрос ' + (index + 1) + ':');
        $('#question h2').text(questions[index].question);
        form.empty();
        form.append(createRadios(questions[index]));
        if (!(isNaN(answer))) {
            $('input[value=' + answer + ']').prop('checked', true);
        }
        form.fadeTo("fast", 1);
        
        p.fadeIn("fast");
    });
}

function createRadios(question) {

    var item = $('<div>');
    for (var i = 0; i < question.answers.length; i++) {
        input = '<label><input type="radio" name="answer" value=' + i + ' />';
        input += question.answers[i] + '</label>';
        item.append(input);
    }
    return item;
}

function getChoise() {
    return $('input[name="answer"]:checked').val();
}

function getResult(answersIndices) {
    let answers = [];
    let result;
    for (var i = 0; i < questions.length; i++) {
        answers.push({ id: questions[i]._id, answer: questions[i].answers[answersIndices[i]] });
    }

    let request = new XMLHttpRequest();
    request.open("POST", "/result", true);
    request.setRequestHeader("Content-Type", "application/json");
    request.send(JSON.stringify({ answers: answers }));
    request.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            result = JSON.parse(request.responseText);
            displayResult(result);            
        }
    }    
}

function displayResult(result) {
    var quiz = $('#quiz');
    quiz.fadeOut(function () {   
        getScore(result);
        $('#list').hide();
        $('#hr').hide();
        quiz.fadeIn();
    });
}

function getScore(result) {
    var percentResult = Math.round((result / questions.length) * 100);
    
    var title = $('#title h1');
    if (percentResult >= 65) {
        title.text("Тест пройден!");
    } else {
        title.text("Тест не сдан :(");
    }
    $('#question p').text("Вы ответили на " + result + " вопросов из " + questions.length + ".");
    $('#question h2').text('Вы набрали ' + (percentResult) + '%');   
}
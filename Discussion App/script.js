var questionTitleNode = document.getElementById("subject");
var questionDescriptionNode= document.getElementById("question");
var submitButtonNode = document.getElementById("submitBtn");
var dataListNode = document.getElementById("dataList");
var questionFormNode = document.getElementById("toggleDisplay");
var respondQueNode = document.getElementById("respondQue");
var resolveHolderNode = document.getElementById("resolveHolder");
var respondAnsNode = document.getElementById("respondAns");
var commentHolderNode = document.getElementById("commentHolder");
var commentNameNode = document.getElementById("pickName");
var commentDescriptionNode = document.getElementById("pickComment");
var commentButtonNode = document.getElementById("commentBtn");
var searchQuestionNode = document.getElementById("questionSearch");
var upvoteButtonNode = document.getElementById("upvote");
var downvoteButtonNode = document.getElementById("downvote");
var newQuestionFormNode = document.getElementById("newQuestionForm");
var resolveQuestionButtonNode = document.getElementById("resolveQuestion");



function onNewQuestionFormClicked(){
    hideDiscussionDetails();
    viewQuestionPanel();
}

function hideDiscussionDetails(){
    respondQueNode.style.display = "none";
    resolveHolderNode.style.display = "none";
    commentHolderNode.style.display = "none";
    respondAnsNode.style.display = "none";

}

function viewQuestionPanel(){
    questionFormNode.style.display = "block";
}

function searchQuestion(event){
    getAllQuestions(function(allQuestions){
        clearAllQuestions();
        tempArray = [];
        if(event.target.value){
            for(var i = 0; i < allQuestions.length; i++){
                if(allQuestions[i].title.includes(event.target.value)){
                    tempArray.push(allQuestions[i]);
                }
            }
            if(tempArray.length){
                tempArray.forEach(addQuestionToLeftPane);
            }
            else{
                dataListNode.innerHTML = "NO MATCH FOUND";
            }
        }
        else{
            allQuestions.forEach(addQuestionToLeftPane);
        }
    });
}

function clearAllQuestions(){
    dataListNode.innerHTML = "";
}

function onLoad(){
    getAllQuestions(function(allQuestions){
        allQuestions = allQuestions.sort(function(currentQ, nextQ){
            if(currentQ.isFav)
                return -1;
            return 1;
        })

        allQuestions.forEach(addQuestionToLeftPane);
    });   
}

onLoad();

function onSubmitQuestion(){

    question = {
        title: "",
        description: "",
        comments: [],
        upvotes: 0,
        downvotes: 0,
        createdAt: Date.now(),
        isFav: false
    }
    
    if(questionTitleNode.value !== "" && questionDescriptionNode.value !== ""){
        question.title = questionTitleNode.value;
        question.description = questionDescriptionNode.value;

        
        saveQuestionToLocalStorage(question, function(){
            addQuestionToLeftPane(question);
        });

        clearQuestionForm();

    } else {
        alert("Fields are mandatory");
    }
}

function addQuestionToLeftPane(question){
    var questionNode = createQuestionNode(question);
    dataListNode.appendChild(questionNode);

    questionNode.addEventListener("click", onQuestionClicked(question));
}

function createQuestionNode(question){
    var questionNode = document.createElement("div");
    questionNode.setAttribute("class", question.title);
    questionNode.setAttribute("id", "questionToLeft")

    var questionTitle = document.createElement("h3");
    var questionDescription = document.createElement("p");
    var questionUpvotes = document.createElement("p");
    var questionDownvotes = document.createElement("p");
    var questionCreatedAtDate = document.createElement("p");
    var questionCreatedBeforeTime = document.createElement("p");
    var isFavButton = document.createElement("button");

    questionTitle.innerHTML = question.title;
    questionDescription.innerHTML = question.description;
    questionUpvotes.innerHTML = "Upvotes: "+question.upvotes;
    questionDownvotes.innerHTML = "Downvotes: "+question.downvotes;
    questionCreatedAtDate.innerHTML = new Date(question.createdAt).toLocaleString();
    questionCreatedBeforeTime.innerHTML = "Created "+updateAndConvertTime(questionCreatedBeforeTime)(question.createdAt)+" ago";
    if(question.isFav)
        isFavButton.innerHTML = "Remove Fav";
    else 
        isFavButton.innerHTML = "Add Fav";

    questionNode.appendChild(questionTitle);
    questionNode.appendChild(questionDescription);
    questionNode.appendChild(questionUpvotes);
    questionNode.appendChild(questionDownvotes);
    questionNode.appendChild(questionCreatedAtDate);
    questionNode.appendChild(questionCreatedBeforeTime);
    questionNode.appendChild(isFavButton);

    isFavButton.addEventListener("click", toggleIsFav(question));

    return questionNode;
}

function toggleIsFav(question){
    return function(event){
        event.stopPropagation();
        question.isFav = !question.isFav;
        updateQuestionInLocalStorage(question, function(){
            if(question.isFav)
                event.target.innerHTML = "Remove Fav";
            else 
                event.target.innerHTML = "Add Fav";
        });
    }
}

function saveQuestionToLocalStorage(question, onQuestionSave){

    getAllQuestions(function(allQuestions){
        allQuestions.push(question);
        //localStorage.setItem("questions", JSON.stringify(allQuestions));


        var body = {
            data: JSON.stringify(allQuestions)
        }

        var request = new XMLHttpRequest();

        request.open("POST", "https://storage.codequotient.com/data/save");
        request.setRequestHeader("Content-Type", "application/json");

        request.send(JSON.stringify(body));
        
        request.addEventListener("load", function(){
            onQuestionSave();
        });
    });  
}

function getAllQuestions(onResponse){

    var request = new XMLHttpRequest();
    request.open("GET", "https://storage.codequotient.com/data/get");
    request.setRequestHeader("Content-Type", "application/json");

    request.send();

    request.addEventListener("load", function(){
        var data = JSON.parse(request.responseText);
        onResponse(JSON.parse(data.data));
    })  
}
function onUpdateQuestion(){

}
function clearQuestionForm(){
    questionTitleNode.value = "";
    questionDescriptionNode.value = "";
}

function onQuestionClicked(question){
    return function(){
        hideQuestionPanel();
        
        clearRespondQueNode();
        clearResponAnsNode();
        showDiscussionDetails();

        addQuestionToRightPane(question);
        // console.log(question);
        question.comments.forEach(function(comment)
        {
            addCommentsToRightPane(comment)
        });

        commentButtonNode.onclick = onCommentButtonClicked(question);
        upvoteButtonNode.onclick = onUpvoteButtonClicked(question);
        downvoteButtonNode.onclick = onDownvoteButtonClicked(question);
        resolveQuestionButtonNode.onclick = onResolveQuestionclicked(question);
    }
}


function hideQuestionPanel(){
    questionFormNode.style.display = "none";
}

function clearRespondQueNode(){
    respondQueNode.innerHTML = "";
}

function clearResponAnsNode(){
    respondAnsNode.innerHTML = "";
}



function showDiscussionDetails(){
    respondQueNode.style.display = "block";
    resolveHolderNode.style.display = "block";
    commentHolderNode.style.display = "block";
    respondAnsNode.style.display = "block";

}

function addQuestionToRightPane(question){

    var questionNode = createQuestionNodeForRightPane(question);
    respondQueNode.appendChild(questionNode);
}

function createQuestionNodeForRightPane(question){
    var questionNode = document.createElement("div");
    questionNode.setAttribute("class", question.title);
    questionNode.setAttribute("id", "questionToLeft")

    var questionTitle = document.createElement("h3");
    var questionDescription = document.createElement("p");
    var questionUpvotes = document.createElement("p");
    var questionDownvotes = document.createElement("p");
    var questionCreatedAtDate = document.createElement("p");
    var questionCreatedBeforeTime = document.createElement("p");
    // var isFavButton = document.createElement("button");

    questionTitle.innerHTML = question.title;
    questionDescription.innerHTML = question.description;
    questionUpvotes.innerHTML = "Upvotes: "+question.upvotes;
    questionDownvotes.innerHTML = "Downvotes: "+question.downvotes;
    questionCreatedAtDate.innerHTML = new Date(question.createdAt).toLocaleString();
    questionCreatedBeforeTime.innerHTML = "Created "+updateAndConvertTime(questionCreatedBeforeTime)(question.createdAt)+" ago";
    // if(question.isFav)
    //     isFavButton.innerHTML = "Remove Fav";
    // else 
    //     isFavButton.innerHTML = "Add Fav";

    questionNode.appendChild(questionTitle);
    questionNode.appendChild(questionDescription);
    questionNode.appendChild(questionUpvotes);
    questionNode.appendChild(questionDownvotes);
    questionNode.appendChild(questionCreatedAtDate);
    questionNode.appendChild(questionCreatedBeforeTime);
    // questionNode.appendChild(isFavButton);

    //isFavButton.addEventListener("click", toggleIsFav(question));

    return questionNode;
}

function onCommentButtonClicked(question){
    return function(){

        var comment = {
            name: "",
            description: ""
        }

        if(commentNameNode.value !== "" && commentDescriptionNode.value !== ""){
            comment.name = commentNameNode.value;
            comment.description = commentDescriptionNode.value;
            question.comments.push(comment);
            saveCommentToLocalStorage(question, comment, function(){
                addCommentsToRightPane(comment);
            });
            

            clearCommentForm();
        } else {
            alert("Fields are mandatory");
        }

        
    }
}

function saveCommentToLocalStorage(question, comment, onCommentSave){
    getAllQuestions(function(allQuestions){
        for(var i = 0; i < allQuestions.length; i++){
            if(allQuestions[i].title == question.title){
                allQuestions[i].comments.push(comment);
            }
        }

        var body = {
            data: JSON.stringify(allQuestions)
        }

        var request = new XMLHttpRequest();

        request.open("POST", "https://storage.codequotient.com/data/save");
        request.setRequestHeader("Content-Type", "application/json");

        request.send(JSON.stringify(body));
        
        request.addEventListener("load", function(){
            onCommentSave();
        });
    });
    
    //localStorage.setItem("questions", JSON.stringify(allQuestions));
}

function addCommentsToRightPane(comment){
    var commentNode = createCommentNode(comment);
    respondAnsNode.appendChild(commentNode);
}

function createCommentNode(comment){
    var commentNode = document.createElement("div");
    commentNode.setAttribute("id", "questionToLeft");

    var commentName = document.createElement("h3");
    var commentDescription = document.createElement("p");

    commentName.innerHTML = comment.name;
    commentDescription.innerHTML = comment.description;

    commentNode.appendChild(commentName);
    commentNode.appendChild(commentDescription);
    return commentNode;
}

function clearCommentForm(){
    commentNameNode.value = "";
    commentDescriptionNode.value = "";
}


function onUpvoteButtonClicked(question){
    return function(){
        question.upvotes++;
        updateQuestionInLocalStorage(question, function(){
            updateQuestionUI(question);
        });
    }
    
}

function onDownvoteButtonClicked(question){
    return function(){
        question.downvotes++;
        updateQuestionInLocalStorage(question, function(){
            updateQuestionUI(question);
        });
        
    }
    
}

function updateQuestionInLocalStorage(question, onUIupdated){
    getAllQuestions(function(allQuestions){
        for(var i = 0; i < allQuestions.length; i++){
            if(allQuestions[i].title == question.title){
                allQuestions[i].upvotes = question.upvotes;
                allQuestions[i].downvotes = question.downvotes;
                allQuestions[i].isFav = question.isFav;
            }
        }

        var body = {
            data: JSON.stringify(allQuestions)
        }

        var request = new XMLHttpRequest();

        request.open("POST", "https://storage.codequotient.com/data/save");
        request.setRequestHeader("Content-Type", "application/json");

        request.send(JSON.stringify(body));
        
        request.addEventListener("load", function(){
            onUIupdated();
        });
        // localStorage.setItem("questions", JSON.stringify(allQuestions));
    });
    
}

function updateQuestionUI(question){
    var questionContainerNode = document.getElementsByClassName(question.title);

    questionContainerNode[0].childNodes[2].innerHTML = "Upvotes: "+question.upvotes;
    questionContainerNode[1].childNodes[2].innerHTML = "Upvotes: "+question.upvotes;
    questionContainerNode[0].childNodes[3].innerHTML = "Downvotes: "+question.downvotes;
    questionContainerNode[1].childNodes[3].innerHTML = "Downvotes: "+question.downvotes;
}

function onResolveQuestionclicked(question){
    return function(){
        updateQuestionInLocalStorageOnResolveClicked(question, function(){
            updateQuestionUIOnResolveClicked();
        });    
    }
}

function updateQuestionUIOnResolveClicked(){
    clearAllQuestions();
    getAllQuestions(function(allQuestions){
        allQuestions.forEach(addQuestionToLeftPane);
    });
    
    hideDiscussionDetails();
    viewQuestionPanel();
}
function updateQuestionInLocalStorageOnResolveClicked(question, onResolve){
    getAllQuestions(function(allQuestions){
        var idx;
        for(var i = 0; i < allQuestions.length; i++){
            if(allQuestions[i].title === question.title){
                idx = i;
            }
        }
        allQuestions.splice(idx, 1);
        var body = {
            data: JSON.stringify(allQuestions)
        }

        var request = new XMLHttpRequest();

        request.open("POST", "https://storage.codequotient.com/data/save");
        request.setRequestHeader("Content-Type", "application/json");

        request.send(JSON.stringify(body));
        
        request.addEventListener("load", function(){
            onResolve();
        });
        
    });
}

function updateAndConvertTime(element){
    return function(time){
        setInterval(function(){
            element.innerHTML = "Created "+convertDateToCreatedAtTime(time)+" ago";
        }, 1000)
        return convertDateToCreatedAtTime(time);
    }
}
function convertDateToCreatedAtTime(date){
    var currentTime = Date.now();
    var timeLapsed = currentTime - new Date(date).getTime();

    timeLapsed = parseInt(timeLapsed/1000);
    var hour = parseInt(timeLapsed/3600);
    var min = parseInt((timeLapsed/60)%60);
    var sec = parseInt(timeLapsed%60);

    if(hour !== 0)
        return hour+" hrs "+min+" mins";
    if(min !== 0)
        return min+" mins "+sec+" seconds";
    else
        return sec+" seconds";
}

submitButtonNode.addEventListener("click", onSubmitQuestion);
searchQuestionNode.addEventListener("keyup", searchQuestion);
newQuestionFormNode.addEventListener("click", onNewQuestionFormClicked)

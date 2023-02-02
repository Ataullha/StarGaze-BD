Dropzone.autoDiscover = false;

function init() {
    let dz = new Dropzone("#dropzone", {
        url: "/",
        maxFiles: 1,
        addRemoveLinks: true,
        dictDefaultMessage: "Some Message",
        autoProcessQueue: false
    });

    dz.on("addedfile", function () {
        if (dz.files[1] != null) {
            dz.removeFile(dz.files[0]);
        }
    });

    dz.on("complete", function (file) {
        let imageData = file.dataURL;

        var url = "http://127.0.0.1:5000/classify_image";

        $.post(url, {
            image_data: file.dataURL
        }, function (data, status) {
            /* 

           data =   [
               {
                class: "Shakib Al Hasan",
                class_probability: [0.05,0.15, 0.03, 0.12, 0.07, 0.08, 0.13, 99.22, 0.04, 0.11],
                class_dictionary: {
                    Ayman Sadiq: 0,
                    Bangabandhu Sheikh Mujibur Rahman: 1
                    Humayun Ahmed: 2,
                    Jamilur Reza Chowdhury: 3
                    Muhammad Zafar Iqbal: 4,
                    Runa Laila: 5,
                    Shahidul Alam: 6,
                    Shakib Al Hasan: 7,
                    Sheikh Hasina: 8,
                    Wasfia Nazreen: 9
                              }
                 }
                    ]
            */
            console.log(data);
            if (!data || data.length == 0) {
                $("#resultHolder").hide();
                $("#divClassTable").hide();
                $("#error").show();
                return;
            }
            let player = ["ayman_sadiq", "bangabandhu_sheikh_mujibur_rahman", "humayun_ahmed", "jamilur_reza_chowdhury", "muhammad_zafar_iqbal", "runa_laila", "shahidul_alam", "shakib_al_hasan", "sheikh_hasina", "wasfia_nazreen"];

            let match = null;
            let bestScore = -1;
            for (let i = 0; i < data.length; ++i) {
                let maxScoreForThisClass = Math.max(...data[i].class_probability);
                if (maxScoreForThisClass > bestScore) {
                    match = data[i];
                    bestScore = maxScoreForThisClass;
                }
            }
            if (match) {
                $("#error").hide();
                $("#resultHolder").show();
                $("#divClassTable").show();
                $("#resultHolder").html($(`[data-player="${match.class}"`).html());
                let classDictionary = match.class_dictionary;
                console.log(classDictionary)
                // console.log(class_probability)
                for (let personName in classDictionary) {

                    // Bug Fix: Incorrect format of element name
                    // Before Fix: elementName = 'score_Ayman Sadiq'
                    // After Fix: elementName = 'ayman_sadiq'

                    // The original code had a bug where the element name was not in the proper format. It had a prefix of "score_" and the name was not in lowercase with underscores separating the words.

                    // The bug was fixed by converting the name to lowercase using the .toLowerCase() method and splitting the name by spaces and joining with underscores using .split(' ').join('_') method.

                    // The corrected code is as follows:

                    person_names = personName.toLowerCase().split(' ');
                    person_name = person_names.join('_');
                    console.log(person_name); // Output: "ayman_sadiq"
                    // With this fix, the element name is now in the proper format, ensuring consistent naming conventions and avoiding future bugs related to incorrect naming.

                    // Author: Md Ataullha
                    // Date: 02-Feb-2023 11:50 AM


                    let index = classDictionary[personName];
                    let probailityScore = match.class_probability[index];
                    let elementName = "score_" + person_name;
                    console.log(personName);
                    document.getElementById(elementName).innerHTML = probailityScore;
                }
            }
            // dz.removeFile(file);            
        });
    });

    $("#submitBtn").on('click', function (e) {
        dz.processQueue();
    });
}

$(document).ready(function () {
    console.log("ready!");
    $("#error").hide();
    $("#resultHolder").hide();
    $("#divClassTable").hide();

    init();
});


const carousel = document.querySelector(".carousel"),
firstImg = carousel.querySelectorAll("img")[0],
arrowIcons = document.querySelectorAll(".wrapper i");

let isDragStart = false, isDragging = false, prevPageX, prevScrollLeft, positionDiff;

const showHideIcons = () => {
    // showing and hiding prev/next icon according to carousel scroll left value
    let scrollWidth = carousel.scrollWidth - carousel.clientWidth; // getting max scrollable width
    arrowIcons[0].style.display = carousel.scrollLeft == 0 ? "none" : "block";
    arrowIcons[1].style.display = carousel.scrollLeft == scrollWidth ? "none" : "block";
}

arrowIcons.forEach(icon => {
    icon.addEventListener("click", () => {
        let firstImgWidth = firstImg.clientWidth + 14; // getting first img width & adding 14 margin value
        // if clicked icon is left, reduce width value from the carousel scroll left else add to it
        carousel.scrollLeft += icon.id == "left" ? -firstImgWidth : firstImgWidth;
        setTimeout(() => showHideIcons(), 60); // calling showHideIcons after 60ms
    });
});

const autoSlide = () => {
    // if there is no image left to scroll then return from here
    if(carousel.scrollLeft - (carousel.scrollWidth - carousel.clientWidth) > -1 || carousel.scrollLeft <= 0) return;

    positionDiff = Math.abs(positionDiff); // making positionDiff value to positive
    let firstImgWidth = firstImg.clientWidth + 14;
    // getting difference value that needs to add or reduce from carousel left to take middle img center
    let valDifference = firstImgWidth - positionDiff;

    if(carousel.scrollLeft > prevScrollLeft) { // if user is scrolling to the right
        return carousel.scrollLeft += positionDiff > firstImgWidth / 3 ? valDifference : -positionDiff;
    }
    // if user is scrolling to the left
    carousel.scrollLeft -= positionDiff > firstImgWidth / 3 ? valDifference : -positionDiff;
}

const dragStart = (e) => {
    // updatating global variables value on mouse down event
    isDragStart = true;
    prevPageX = e.pageX || e.touches[0].pageX;
    prevScrollLeft = carousel.scrollLeft;
}

const dragging = (e) => {
    // scrolling images/carousel to left according to mouse pointer
    if(!isDragStart) return;
    e.preventDefault();
    isDragging = true;
    carousel.classList.add("dragging");
    positionDiff = (e.pageX || e.touches[0].pageX) - prevPageX;
    carousel.scrollLeft = prevScrollLeft - positionDiff;
    showHideIcons();
}

const dragStop = () => {
    isDragStart = false;
    carousel.classList.remove("dragging");

    if(!isDragging) return;
    isDragging = false;
    autoSlide();
}

carousel.addEventListener("mousedown", dragStart);
carousel.addEventListener("touchstart", dragStart);

document.addEventListener("mousemove", dragging);
carousel.addEventListener("touchmove", dragging);

document.addEventListener("mouseup", dragStop);
carousel.addEventListener("touchend", dragStop);
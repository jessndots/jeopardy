// categories is the main data structure for the app; it looks like this:

//  [
//    { title: "Math",
//      clues: [
//        {question: "2+2", answer: 4, showing: null},
//        {question: "1+1", answer: 2, showing: null}
//        ...
//      ],
//    },
//    { title: "Literature",
//      clues: [
//        {question: "Hamlet Author", answer: "Shakespeare", showing: null},
//        {question: "Bell Jar Author", answer: "Plath", showing: null},
//        ...
//      ],
//    },
//    ...
//  ]


/** Get NUM_CATEGORIES random category from API.
 *
 * Returns array of category ids
 */
let catIds = new Set();
let numCats = 6

async function getCategoryIds() {
    while (catIds.size < numCats) {
        try {
            let response = await axios.get('https://jservice.io/api/category', { params: { id: Math.floor(Math.random() * 20000) } });
            let questions = new Set()
            for (let i = 0; i < response.data.clues.length; i++) {
                questions.add(response.data.clues[i].question)
            }
            if (questions.size > 4) {
                catIds.add(response.data.id);
            }
        }
        catch (err) {

        }
    }
    catIds = [...catIds]
    return [...catIds]
}


/** Return object with data about a category:
 *
 *  Returns { title: "Math", clues: clue-array }
 *
 * Where clue-array is:
 *   [
 *      {question: "Hamlet Author", answer: "Shakespeare", showing: null},
 *      {question: "Bell Jar Author", answer: "Plath", showing: null},
 *      ...
 *   ]
 */

async function getCategory(catId) {
    let response = await axios.get('https://jservice.io/api/category', { params: { id: catId } });
    let clueArray = []
    for (let clue of response.data.clues) {
        clueArray.push({
            question: clue.question,
            answer: clue.answer,
            value: clue.value,
            showing: null
        })
    }
    let catData = {
        id: catId,
        title: response.data.title,
        clues: clueArray
    }
    return catData
}

/** Fill the HTML table#jeopardy with the categories & cells for questions.
 *
 * - The <thead> should be filled w/a <tr>, and a <td> for each category
 * - The <tbody> should be filled w/NUM_QUESTIONS_PER_CAT <tr>s,
 *   each with a question for each category in a <td>
 *   (initally, just show a "?" where the question/answer would go.)
 */
let clues = []
async function fillTable() {
    for (let i = 0; i < catIds.length; i++) {
        let catData = await getCategory(catIds[i]);
        $("#cat-row").append(`<th>${catData.title}</th>`);


        $('#row1').append(`<td id='${i + 1}-1' data-catId='${catIds[i]}' data-column='${i + 1}' data-row='1'>?</td>`)
        $('#row2').append(`<td id='${i + 1}-2' data-catId='${catIds[i]}' data-column='${i + 1}' data-row='2'>?</td>`)
        $('#row3').append(`<td id='${i + 1}-3' data-catId='${catIds[i]}' data-column='${i + 1}' data-row='3'>?</td>`)
        $('#row4').append(`<td id='${i + 1}-4' data-catId='${catIds[i]}' data-column='${i + 1}' data-row='4'>?</td>`)
        $('#row5').append(`<td id='${i + 1}-5' data-catId='${catIds[i]}' data-column='${i + 1}' data-row='5'>?</td>`)
        let selectedClues = [];
        let questions = new Set();
        if (catData.clues.length < 5) { console.log('error - not enough clues') } else {
            while (selectedClues.length < 5) {
                let clue = catData.clues[Math.floor(Math.random() * catData.clues.length)];
                if (!(questions.has(clue.question))) {
                    selectedClues.push(clue)
                    questions.add(clue.question)
                }
            }
        }
        clues.push(selectedClues)
    }

}

/** Handle clicking on a clue: show the question or answer.
 *
 * Uses .showing property on clue to determine what to show:
 * - if currently null, show question & set .showing to "question"
 * - if currently "question", show answer & set .showing to "answer"
 * - if currently "answer", ignore click
 * */

async function handleClick(target) {
    const row = $(target).attr('data-row');
    const column = $(target).attr('data-column');
    const clue = clues[column - 1][row - 1];
    if (clue.showing == null) {
        $(`#${column}-${row}`).html(`${clue.question}`);
        clue.showing = 'question';
    } else if (clue.showing == 'question') {
        $(`#${column}-${row}`).html(`${clue.answer}`);
        clue.showing = 'answer';
    }
}

/** Wipe the current Jeopardy board, show the loading spinner,
 * and update the button used to fetch data.
 */

function showLoadingView() {
    $('table').css('visibility', 'collapse');
    $('#loading-div').css('visibility', 'visible');
}

/** Remove the loading spinner and update the button used to fetch data. */

function hideLoadingView() {
    $('#loading-div').css('visibility', 'hidden');
    $('table').css('visibility', 'visible');
}

/** Start game:
 *
 * - get random category Ids
 * - get data for each category
 * - create HTML table
 * */

async function setupAndStart() {
    $('#content').remove();
    $('body').prepend('<div id="content"></div>')    
    $('#content').append('<h1 id="title">JEOPARDY!</h1>');
    $('#content').append('<a id="newGame">New Game</a>');
    $('#content').append('<br></br>')
    $('#content').append('<table id="jeopardy-table"><thead><tr id="cat-row"></tr></thead><tbody><tr id="row1"></tr><tr id="row2"></tr><tr id="row3"></tr><tr id="row4"></tr><tr id="row5"></tr></tbody></table>')
    $('#content').append('<div id="loading-div"><p>LOADING...</p></div>')

    showLoadingView() //change back to showLoadingView()
    catIds = new Set();
    clues = [];
    await getCategoryIds();
    await fillTable();
    hideLoadingView()
}

/** On click of start / restart button, set up game. */
$('body').on('click', '#newGame', async function () {
    await setupAndStart()
})

/** On page load, add event handler for clicking clues */
$(document).ready(async function () {
    await setupAndStart()
    $('body').on('click', 'td', function (evt) {
        handleClick(evt.target)
    })
    
})





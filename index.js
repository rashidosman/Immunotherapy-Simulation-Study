// Here we define dependencies we need for the program
var fs = require('fs'); // fs stands for the File System of the machine 
const Path = require("path"); // Allows natively formatting file paths

// This file defines the logic and 
// utilization of the previously
// generated population storage files.

// Our study has a total duration of
// 24 months or two years. We will
// divide this into six stages of
// four months each in which adverse
// effects may develop.

// We detect the population data created by the previous application
// Please make sure that the data folder only contains .json files that 
// were generated by the the first stage population generator written in Go.
let Files  = [];

// We create a folder to store the future final data of the three trials for analysis

let dir = './data/final/'

if (fs.existsSync(dir)) {
    console.log("The folder was found")
    fs.rmdirSync(dir, {recursive: true})
    fs.mkdirSync(dir);
} else {
    console.log("The folder was not found")
    fs.mkdirSync(dir);
}
    
function ThroughDirectory(Directory) {
    fs.readdirSync(Directory).forEach(File => {
        const Absolute = Path.join(Directory, File);
        if (fs.statSync(Absolute).isDirectory()) return ThroughDirectory(Absolute);
        else return Files.push(Absolute);
    });
}

ThroughDirectory("./data/initial/");
// We briefly report that we successfully disovered the population data files.
console.log(`\nThe simulation has now been launched with the following discovered data files:\n\n- ${Files[0]}\n- ${Files[1]}\n- ${Files[2]}\n`)

// This is the base function that will choose events based on probability
function eventSimulator(proabability) {
    var randomchance = Math.random();
    var sum = 0;
    proabability.forEach(function(chance) {
        sum+=chance;
    });
    var chance = 0;
    for(var i=0; i<proabability.length; i++) {
        chance+=proabability[i]/sum;
        if(randomchance<chance) {
            return i;
        }
    }
}

// First we create the probability options model for the severity of the adverse effect based on cited statistics

// We use Binomial Probability to consider the amount of event opportunities may happen. Since the 24 month period
// is being divided into six stages of four months each, there are six opportunities to encounter adverse effects

// 65.82% of immunotherapy patients developed any adverse effects.
var eventProbabilityImmuno = ["adverse", "none"];
var eventProbabilityValuesImmuno = [66/2, 34 + 66/2];

// 85.19% of chemotherapy patients developed any adverse effects.
var eventProbabilityChemo = ["adverse", "none"];
var eventProbabilityValuesChemo = [85/2, 15 + 85/2];

// Fatality probabilities for Immunotherapy and Chemotherapy 
var fatalProbabilityChemo = ["fatality", "none"];
var fataleventProbabilityValuesChemo = [87, 9913];

var fatalProbabilityImmuno = ["fatality", "none"];
var fataleventProbabilityValuesImmuno = [128, 9872];

// We create an array container to store the future concluding information
let patientTrialOutcome = {}

// We define this to run for each of the three trial data files
Files.forEach(function(datafile, index) {
    console.log(`Running the analysis for trial data: ` + (index + 1))
    trialData = JSON.parse(fs.readFileSync(Files[index], "utf8"));
    // First create the file for this trial

    for (item in trialData) {
       // Here we run the simulation logic for each patient of the running trial
       // We do this in the previously mentioned six stages representing each four months
        let experienceAdverseEvents = false

       function stageSimulation() {
           // The simulation functions with different statistical probabilities
           // depending on the medication each patient takes.
            if (trialData[item].medication == 'ipilimumab') {
                if (eventProbabilityImmuno[eventSimulator(eventProbabilityValuesImmuno)] == 'adverse') {
                    experienceAdverseEvents = true
                    // This is the logic that occurs 
                } else { // If there is no adverse effect report none
                }
            } else if (trialData[item].medication == 'nivolumab') {
                if (eventProbabilityImmuno[eventSimulator(eventProbabilityValuesImmuno)] == 'adverse') {
                    experienceAdverseEvents = true
                } else { // If there is no adverse effect do nothing
                }
            } else if (trialData[item].medication == 'doxycycline') {
                if (eventProbabilityChemo[eventSimulator(eventProbabilityValuesChemo)] == 'adverse') {
                    experienceAdverseEvents = true
                } else { // If there is no adverse effect do nothing
                }
            }
       }

       function fatalitySimulation() {
           // The rate of fatality for a patient undergoing immunotherapy is approximated 
           // to be 0.87%, as compared with that of chemotherapy, 1.28% [Source 21]
            if (trialData[item].medication == 'ipilimumab' || 'nivolumab' ) {
                if (fatalProbabilityImmuno[eventSimulator(fataleventProbabilityValuesImmuno)] == 'fatality') {
                    return true
                } else {
                    return false
                }
            } else if (trialData[item].medication == 'doxycycline') {
                if (fatalProbabilityChemo[eventSimulator(fataleventProbabilityValuesChemo)] == 'fatality') {
                    return true
                } else {
                    return false
                }
            } else {
                let err = 'We could not detect the medication for the following patient: \n' + item
            }
       }

       // Here we store the results of any adverse events for the stages to later document.
       stageResults = []
       for (i = 0; i < 4; i++) {
        stageSimulation()
       }

       // Store this information in the final container that we prepare documentation
       // in charts and graphs for later.

       let patientinfo = {
        // First we define the previous initial data
        "name": trialData[item].name,
        "agegroup": trialData[item].agegroup,
        "age": trialData[item].age,
        "gender": trialData[item].gender,
        "severity": trialData[item].severity,
        "ethnicity": trialData[item].ethnicity,
        "medication": trialData[item].medication,
        // Now we define the new results in additional properties
        // for later analysis
        "health": 100,
        "adverseevents": experienceAdverseEvents,
        "fatality": fatalitySimulation(),
        // Health between stages
        "stage1": "Healthy",
        "stage2": "Healthy",
        "stage3": "Healthy",
        "stage4": "Healthy"
       }
       
       // We proceed to save all the information to a JSON data file for later analysis
       fs.appendFile(`./data/final/results_trial${index + 1}.json`, JSON.stringify(patientinfo, null, 2), function (err) {
            if (err) throw err;
        });
    } 

    console.log(`\nTrial ${index + 1} has completed producing the following final results file: data/final/results_${index + 1}.json`)
});
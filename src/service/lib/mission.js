const fs = require('fs')

class Mission {
  constructor (missionId) {
    // Look up mission based on ID and populate mission object
    // (throw error if not found)
    this.mission = {}

    // Populated with int for current stage (e.g. 0,1,2), starts off null
    this.currentStage = null
  }

  getName () {
    return this.mission.name
  }

  getNpc () {
    return (this.currentStage === null)
      ? this.mission.npc
      : this.mission.stages[this.currentStage].npc
  }

  getTitle () {
    return (this.currentStage === null)
      ? this.mission.title
      : this.mission.stages[this.currentStage].title
  }

  getText () {
    return (this.currentStage === null)
      ? this.mission.text
      : this.mission.stages[this.currentStage].text
  }

  getStyle () {
    return (this.currentStage === null)
      ? null
      : this.mission.stages[this.currentStage].style || null
  }

  getCurrentStage () {
    return this.currentStage
  }

  isComplete () {
    return !this.mission.stages[this.currentStage].nextStage
  }

  updateMission (event, location = { name: '', type: '' }) {
    // TODO Check progress against mission (should be triggered for all
    // open missions on every event) and progress as appropriate
  }
}

module.exports = Mission

/*
  // Work in progress mission schema

  mission: {
    id: '',

    // Name to display for this mission
    name: ''

    // Title and text for mission invitation message
    title: '',
    text: '',

    // NPC mission giver
    npc: {
      name: '',
      image: null,
    }

    // List of valid stages (non-linear)
    stages: [
      {
        // How to style this message in the UI (null if default styling)
        style: null, // NULL, 'SUCCESS', 'FAILURE'

        // NPC contact for this stage of the mission
        npc: {
          name: '',
          image: null,
        }

        // Title and text to display for this stage of the mission
        title: '',
        text: '',

        // One or more criteria to evaluate. If no criteria, just displays
        // heading/text (e.g. no criteria for the final stage in a misssion).
        // The first criteria to have it's requirements met is the only one
        // used so order may matter depending on wha the requirements are.
        criteria: [{
          // location where the player needs to be to meet the criteria when
          // the event is logged. The location object can be null/ommitted, in
          // which case the requirements can be met anywhere.
          location: {
            type: '', // 'SYSTEM', 'BODY', 'SETTLEMENT', 'STATION', 'MEGASHIP', 'POI'
            name: '', // Name of the System / Settlement / Station / POI type / etc
          },

          // Type of game events to listen for
          event: 'EVENT_NAME', // EVENT_NAME

          // One or more requirements to test, defined as JSON path expressions
          // to be run against the event specified above. If requirements are
          // are null or empty, the event simply needs to occur (in the
          // specified location, if a location is defined).
          //
          // All requirements specified for this stage must be met to progress
          // to be able to progress to the next stage.
          //
          // NB: If any of multiple criteria are valid, you can define multiple
          // criteria for this stage, each with a single test. The first
          // criteria object (as processed sequentially) to have all it's
          // requirements met determines what the next stage is. This makes it
          // possible to have multiple ways of succeeding a mission, as well as
          // multiple ways of failing a mission.
          requirements: [{
            // Optional description to display in UI (null if none)
            description: 'Obtain 5T of Silver',
            test: // JSON path expression (or similar)
          }],

          nextStage: 2, // Stage to go to on success. If null, mission is over.
          nextMission: null // If a Mission ID is specified, trigger an invite
                            // to a new mission.
        },]
      }
    ]
  }
*/

import { useState, useEffect, useRef } from 'react'
import animateTableEffect from 'lib/animate-table-effect'
import Layout from 'components/layout'
import Panel from 'components/panel'
import MisListPanel from 'components/panels/mis/mis-list-panel'
import MisInspectorPanel from 'components/panels/mis/mis-inspector-panel'
import { useSocket, eventListener, sendEvent } from 'lib/socket'

export default function MisPage () {
  const { connected, active, ready } = useSocket()
  const [componentReady, setComponentReady] = useState(false)
  const [missionEntries, setMissionEntries] = useState([])
  const [selectedMissionEntry, setSelectedMissionEntry] = useState(null)

  const selectedMissionEntryRef = useRef(selectedMissionEntry);
  const missionEntriesRef = useRef(missionEntries);

  function removeMission(mission) {
    const newMissionEntries = []
    for(let entry of missionEntriesRef.current) {
      if(entry.MissionID != mission.MissionID)
        newMissionEntries.push(entry)
    }

    updateEntries(newMissionEntries)
  }

  function completeMission(mission) {
    for(let entry of missionEntriesRef.current) {
      if(entry.MissionID == mission.MissionID) {
        entry.State = "Complete"
        entry.CompleteData = mission
      }
    }

    updateEntries(missionEntriesRef.current)
  }

  function failMission(mission) {
    for(let entry of missionEntriesRef.current) {
      if(entry.MissionID == mission.MissionID) {
        entry.State = "Failed"
        entry.FailData = mission
      }
    }

    updateEntries(missionEntriesRef.current)
  }

  function redirectMission(mission) {
    for(let entry of missionEntriesRef.current) {
      if(entry.MissionID == mission.MissionID) {
        entry.RedirectData = mission
      }
    }

    updateEntries(missionEntriesRef.current)
  }

  function addMission(mission) {
    if(mission.Expiry) {
      const currentDate = new Date()
      const currentTS = currentDate.getTime()
      const expiryDateTs = new Date(mission.Expiry).getTime()
      const expireInSeconds = Math.floor((expiryDateTs - currentTS) / 1000);
      mission.Expires = expireInSeconds
    }

    missionEntriesRef.current.push(mission)
    missionEntriesRef.current.sort((first, second) => first.Expires - second.Expires)

    updateEntries(missionEntriesRef.current)
  }

  function updateEntries(missions) {
    setMissionEntries(missions);
  
    if (!missions || missions.length === 0) {
      setSelectedMissionEntry(null);
      return;
    }
  
    if (selectedMissionEntryRef.current) {
      const stillHasSelectedMission = missions.find(m => m.MissionID === selectedMissionEntryRef.current.MissionID);
      if (!stillHasSelectedMission) {
        setSelectedMissionEntry({ ...missions[missions.length - 1] });
        return;
      }
    }
  
    setSelectedMissionEntry(prevState => prevState || { ...missions[missions.length - 1] });
  }

  useEffect(animateTableEffect)

  function updateAllMissions(newMissionEntries){
    if(!newMissionEntries) return

    const missions = []
    for(let mission of newMissionEntries.Active) {
      mission.State = "Active"
      missions.push(mission)
    }

    for(let mission of newMissionEntries.Failed) {
      mission.State = "Failed"
      missions.push(mission)
    }

    for(let mission of newMissionEntries.Complete) {
      mission.State = "Complete"
      missions.push(mission)
    }

    missions.sort((first, second) => first.Expires - second.Expires)

    console.log(missions)

    if (Array.isArray(missions) && missions.length > 0) {
      updateEntries(missions)
    }
  }

  useEffect(() => {
    selectedMissionEntryRef.current = selectedMissionEntry;
  }, [selectedMissionEntry]);

  useEffect(() => {
    missionEntriesRef.current = missionEntries;
  }, [missionEntries]);

  useEffect(async () => {
    if (!connected) return
    setComponentReady(false)
    const newMissionEntries = await sendEvent('getActiveMissions', { count: 100 })
    updateAllMissions(newMissionEntries)
    setComponentReady(true)
  }, [connected])

  useEffect(() => eventListener('newLogEntry', async (newLogEntry) => {
    if (!['MissionAbandoned', 'MissionAccepted', 'MissionCompleted', 'MissionFailed', 'MissionRedirected', 'Missions'].includes(newLogEntry.event))
      return

    switch(newLogEntry.event) {
      case "MissionAbandoned":
        removeMission(newLogEntry)
        break
      case "MissionAccepted":
        addMission(newLogEntry)
        break
      case "MissionCompleted":
        completeMission(newLogEntry)
        break
      case "MissionFailed":
        failMission(newLogEntry)
        break
      case "MissionRedirected":
        redirectMission(newLogEntry)
        break
      case "Missions":
        //reload all missions
        updateAllMissions(newLogEntry)
        break;
      default:
        break
    }
  }), [])

  return (
    <Layout connected={connected} active={active} ready={ready && componentReady}>
      <Panel layout='left-half' scrollable>
        <MisListPanel missionEntries={missionEntries} setSelectedMissionEntry={setSelectedMissionEntry} />
        {ready && missionEntries.length === 0 && <p style={{ margin: '2rem 0' }} className='text-center text-muted'>No recent log entries</p>}
      </Panel>
      <Panel layout='right-half' scrollable>
        <MisInspectorPanel misEntry={selectedMissionEntry} />
      </Panel>
    </Layout>
  )
}

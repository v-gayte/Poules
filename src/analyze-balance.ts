
import {
  TECH_TREE,
  SERVER_ASSETS,
  CLASSROOM_PCS,
  NETWORK_EQUIPMENT,
  TEACHERS,
  GENERATOR_LEVELS,
  SERVER_ROOM_LEVELS,
  GYM_LEVELS} from './config/gameConfig.ts'

const analyze = () => {
  console.log('--- Game Balance Analysis ---')

  // 1. Tech Tree Integrity
  console.log('\n[1] Checking Tech Tree Integrity...')
  const techIds = new Set(TECH_TREE.map(t => t.id))
  const errors: string[] = []

  // Check Tech Dependencies
  TECH_TREE.forEach(tech => {
    tech.reqs.forEach(req => {
      if (!techIds.has(req)) {
        errors.push(`Tech '${tech.id}' requires unknown tech '${req}'`)
      }
    })
  })

  // Check Item Requirements
  const checkReq = (itemId: string, req?: string | null) => {
    if (req && !techIds.has(req)) {
      errors.push(`Item '${itemId}' requires unknown tech '${req}'`)
    }
  }

  GENERATOR_LEVELS.forEach(l => checkReq(`Generator L${l.level}`, l.techReq))
  SERVER_ROOM_LEVELS.forEach(l => checkReq(`Server Room L${l.level}`, l.techReq))
  Object.values(SERVER_ASSETS).forEach(asset => checkReq(`Server Asset ${asset.id}`, asset.techReq))
  CLASSROOM_PCS.forEach(pc => checkReq(`PC L${pc.level}`, pc.techReq))
  NETWORK_EQUIPMENT.forEach(n => checkReq(`Network L${n.level}`, n.techReq))
  TEACHERS.forEach(t => checkReq(`Teacher L${t.level}`, t.techReq))
  GYM_LEVELS.forEach(g => checkReq(`Gym L${g.level}`, g.techReq))

  if (errors.length > 0) {
    console.error('Found Integrity Errors:')
    errors.forEach(e => console.error(`- ${e}`))
  } else {
    console.log('Tech Tree Integrity: OK')
  }

  // 2. Economy Analysis (ROI)
  console.log('\n[2] Economy Analysis (ROI in seconds)...')
  
  const calculateROI = (cost: number, income: number) => {
    if (income === 0) return 'Infinity'
    // Tick rate is 1000ms (1s)
    const seconds = cost / income
    return seconds.toFixed(1) + 's'
  }

  console.log('\n-- Server Assets (Level 1) --')
  Object.values(SERVER_ASSETS).forEach(asset => {
    const l1 = asset.levels[0]
    console.log(`${asset.name}: Cost ${l1.cost}, Income ${l1.income}/t => ROI: ${calculateROI(l1.cost, l1.income)}`)
  })

  console.log('\n-- Classroom PCs --')
  CLASSROOM_PCS.forEach(pc => {
    console.log(`${pc.name}: Cost ${pc.cost}, Income ${pc.income}/t => ROI: ${calculateROI(pc.cost, pc.income)}`)
  })

  console.log('\n-- Teachers --')
  TEACHERS.forEach(t => {
    console.log(`${t.name}: Cost ${t.cost}, Income ${t.income}/t => ROI: ${calculateROI(t.cost, t.income)}`)
  })

  console.log('\n-- Network --')
  NETWORK_EQUIPMENT.forEach(n => {
    console.log(`${n.name}: Cost ${n.cost}, Income ${n.income}/t => ROI: ${calculateROI(n.cost, n.income)}`)
  })

  // 3. Energy Analysis
  console.log('\n[3] Energy Analysis...')
  console.log('Generator Capacities vs Costs:')
  GENERATOR_LEVELS.forEach(g => {
    console.log(`${g.name}: Cap ${g.capacity}, Cost ${g.cost} => ${g.cost/g.capacity} $/Energy`)
  })

}

analyze()

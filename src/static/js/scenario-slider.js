/* Continuous, illustrative interpolation between the existing scenario benchmarks. */
(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.CareerLensScenario=api;
})(typeof window==='undefined'?globalThis:window,function(){
  const clamp=value=>Math.max(0,Math.min(1,Number(value)||0));
  const lerp=(a,b,t)=>Math.round((a+(b-a)*t)*10)/10;
  function blendTrend(moderate,fast,value){
    const t=clamp(value);
    return {...moderate,scenario:t===0?'moderate':t===1?'fast':'blended',
      scenario_label:t===0?moderate.scenario_label:t===1?fast.scenario_label:`Blended AI adoption scenario · ${Math.round(t*100)}%`,
      emerging_skills:moderate.emerging_skills.map(row=>({...row,growth_pct:lerp(row.growth_pct,fast.emerging_skills.find(x=>x.skill===row.skill)?.growth_pct??row.growth_pct,t)})),
      declining_tasks:moderate.declining_tasks.map(row=>({...row,automation_risk_pct:lerp(row.automation_risk_pct,fast.declining_tasks.find(x=>x.task===row.task)?.automation_risk_pct??row.automation_risk_pct,t)})),
    };
  }
  function blendRoles(moderate,fast,value){
    const t=clamp(value);
    if(t===0||t===1)return (t===0?moderate:fast).map(row=>({...row,explainable_breakdown:{...row.explainable_breakdown}}));
    const endpoints=new Map(fast.map(row=>[row.role_id,row]));
    return moderate.map(row=>{
      const end=endpoints.get(row.role_id)||row;
      const breakdown={...row.explainable_breakdown};
      for(const key of Object.keys(breakdown))if(typeof breakdown[key]==='number'&&typeof end.explainable_breakdown[key]==='number')breakdown[key]=lerp(breakdown[key],end.explainable_breakdown[key],t);
      return {...row,match_score:lerp(row.match_score,end.match_score,t),demand_outlook:lerp(row.demand_outlook,end.demand_outlook,t),explainable_breakdown:breakdown};
    }).sort((a,b)=>b.match_score-a.match_score);
  }
  return {clamp,blendTrend,blendRoles};
});

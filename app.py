from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
import numpy as np
import re

app = FastAPI(
    title="Harmonized Mind — ГРА без этики",
    description="Симулятор гибридного резонансного алгоритма без этической фильтрации"
)

# ================================
# ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ГРА
# ================================

def extract_domains(prompt: str) -> List[str]:
    mapping = {
        r"(сверхпровод|Tc|материал|давление|физика)": "physics",
        r"(медицина|здоровье|лечение|доступ|аборция)": "healthcare",
        r"(женщина|права|дискриминация|Северный Кавказ|социальный)": "social",
        r"(образование|школа|университет)": "education",
        r"(климат|экология|углерод)": "climate"
    }
    domains = []
    for pattern, domain in mapping.items():
        if re.search(pattern, prompt, re.IGNORECASE):
            domains.append(domain)
    return domains if domains else ["general"]

def generate_agents(prompt: str, domains: List[str], n: int = 12) -> List[Dict]:
    agents = []
    for i in range(n):
        if "physics" in domains:
            Tc = np.random.uniform(100, 350)
            pressure = np.random.uniform(0, 200)
            toxic = np.random.choice([True, False], p=[0.3, 0.7])
            rare = np.random.choice([True, False], p=[0.4, 0.6])
            q = np.random.uniform(0.6, 1.0, 3).tolist()
            m = np.random.uniform(0.7, 1.4, 3).tolist()
            agents.append({
                "id": i,
                "name": f"Material-{i+1}",
                "domain": "physics",
                "type": "material",
                "Tc": Tc,
                "pressure_GPa": pressure,
                "toxic": toxic,
                "rare_elements": rare,
                "q": q,
                "m": m
            })
        elif "social" in domains or "healthcare" in domains:
            access = np.random.uniform(0.1, 0.95)
            safety = np.random.uniform(0.1, 0.95)
            q = [access, safety]
            m = [0.85, 0.9]
            domain = "social" if "social" in domains else "healthcare"
            agents.append({
                "id": i,
                "name": f"Policy-{i+1}",
                "domain": domain,
                "type": "policy",
                "access_score": access,
                "safety_score": safety,
                "q": q,
                "m": m
            })
        else:
            q = [0.7, 0.65]
            m = [1.0, 1.1]
            agents.append({
                "id": i,
                "name": f"Generic-{i+1}",
                "domain": "general",
                "type": "generic",
                "q": q,
                "m": m
            })
    return agents

def compute_omega_res(q: List[float], m: List[float], D: float = 2.5) -> float:
    """ω_рез = (1/D) * Σ (q_k / m_k)"""
    q, m = np.array(q), np.array(m)
    if np.any(m <= 0):
        return -np.inf
    return float((1.0 / D) * np.sum(q / m))

def run_gra_simulation(prompt: str) -> Dict[str, Any]:
    domains = extract_domains(prompt)
    agents = generate_agents(prompt, domains)

    D_fractal = 2.5
    omegas = [compute_omega_res(a["q"], a["m"], D=D_fractal) for a in agents]
    omegas = np.array(omegas)

    # α_i = softmax(ω_рез,i)
    alpha = np.exp(omegas - np.max(omegas))
    alpha = alpha / (alpha.sum() + 1e-8)

    # P_i — вероятность успеха подцели
    P_i = []
    for agent in agents:
        if agent["type"] == "material":
            P = min(1.0, agent["Tc"] / 293.0)
        elif agent["type"] == "policy":
            P = (agent.get("access_score", 0) + agent.get("safety_score", 0)) / 2
        else:
            P = 0.5
        P_i.append(P)

    # P_total = 1 - ∏(1 - P_i)
    P_total = float(1.0 - np.prod([1.0 - p for p in P_i]))

    foam = []
    for i, agent in enumerate(agents):
        foam.append({
            "agent": agent,
            "amplitude": float(alpha[i]),
            "omega_res": float(omegas[i]),
            "P_i": float(P_i[i])
        })

    return {
        "status": "success",
        "foam": foam,
        "P_total": P_total,
        "D_fractal": D_fractal
    }

# ================================
# API
# ================================

class PromptRequest(BaseModel):
    prompt: str

@app.post("/api/run-gra")
async def run_gra_endpoint(request: PromptRequest):
    try:
        result = run_gra_simulation(request.prompt)

        top = max(
            result["foam"],
            key=lambda x: x["amplitude"] * x["P_i"]
        )
        agent = top["agent"]

        if agent["type"] == "material":
            solution = (
                f"Материал: {agent['name']}\n"
                f"• T_c = {agent['Tc']:.1f} K\n"
                f"• Давление = {agent['pressure_GPa']:.1f} ГПа\n"
                f"• Безопасен: {'Да' if not (agent['toxic'] or agent['rare_elements']) else 'Нет'}"
            )
        elif agent["type"] == "policy":
            solution = (
                f"Рекомендация: {agent['name']}\n"
                f"• Доступ = {agent['access_score']:.2f}\n"
                f"• Безопасность = {agent['safety_score']:.2f}"
            )
        else:
            solution = f"Решение: {agent['name']}"

        return {
            "status": "success",
            "prompt": request.prompt,
            "solution": solution,
            "P_total": round(result["P_total"], 3),
            "top_amplitude": round(top["amplitude"], 3),
            "D_fractal": result["D_fractal"]
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка симуляции: {str(e)}")
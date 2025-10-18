from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import numpy as np
import re

app = FastAPI(
    title="Harmonized Mind — Человекоцентричный ГРА",
    description="Симулятор гибридного резонансного алгоритма с этической фильтрацией и 'пеной разума'"
)

# ================================
# ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ГРА
# ================================

def detect_humanitarian_context(prompt: str) -> bool:
    humanitarian_keywords = [
        "женщина", "права", "дискриминация", "аборция", "насилие",
        "медицина", "здоровье", "социальный", "справедливость",
        "Северный Кавказ", "угнетение", "доступ", "равенство"
    ]
    return any(kw in prompt.lower() for kw in humanitarian_keywords)

def extract_domains(prompt: str) -> List[str]:
    mapping = {
        r"(сверхпровод|Tc|материал|давление|физика)": "physics",
        r"(медицина|здоровье|лечение|доступ|аборция)": "healthcare",
        r"(женщина|права|дискриминация|Северный Кавказ|социальный)": "ethics_social",
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
    humanitarian = detect_humanitarian_context(prompt)
    
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
                "m": m,
                "humanitarian": False
            })
        elif "ethics_social" in domains:
            access = np.random.uniform(0.1, 0.95)
            safety = np.random.uniform(0.1, 0.95)
            q = [access, safety]
            m = [0.85, 0.9]
            agents.append({
                "id": i,
                "name": f"Policy-{i+1}",
                "domain": "ethics_social",
                "type": "social_policy",
                "access_score": access,
                "safety_score": safety,
                "q": q,
                "m": m,
                "humanitarian": True
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
                "m": m,
                "humanitarian": humanitarian
            })
    return agents

def compute_agent_benefit(agent: Dict) -> float:
    if agent["type"] == "material":
        return agent["Tc"] / 300.0
    elif agent["type"] == "social_policy":
        return (agent["access_score"] + agent["safety_score"]) / 2
    return 0.5

def compute_human_benefit(agent: Dict) -> float:
    if agent["type"] == "material":
        pressure_score = max(0.0, 1.0 - agent["pressure_GPa"] / 10.0)
        safety = 0.0 if (agent["toxic"] or agent["rare_elements"]) else 1.0
        return 0.6 * pressure_score + 0.4 * safety
    elif agent["type"] == "social_policy":
        return (agent["access_score"] + agent["safety_score"]) / 2
    return 0.5

def compute_gamma(agent: Dict, humanitarian_context: bool) -> float:
    """
    Γ = Σ sign(dI_i/dt) · γ_ij  (упрощённо γ_ij = 1)
    """
    if not humanitarian_context and agent["type"] != "social_policy":
        return 1.0  # этика отключена → нейтрально

    dI_i = compute_agent_benefit(agent)
    dI_h = compute_human_benefit(agent)
    sign_product = np.sign(dI_i * dI_h)
    return float(sign_product)

def compute_omega_res(q: List[float], m: List[float], D: float = 2.5) -> float:
    """ω_рез = (1/D) * Σ (q_k / m_k)"""
    q, m = np.array(q), np.array(m)
    if np.any(m <= 0):
        return -np.inf
    return float((1.0 / D) * np.sum(q / m))

def run_gra_simulation(prompt: str) -> Dict[str, Any]:
    domains = extract_domains(prompt)
    humanitarian = detect_humanitarian_context(prompt)
    agents = generate_agents(prompt, domains)

    # === Этический фильтр: Γ_i > 0 ===
    ethical_agents = []
    for agent in agents:
        gamma = compute_gamma(agent, humanitarian)
        if gamma > 0:
            agent["Gamma"] = gamma
            ethical_agents.append(agent)

    if not ethical_agents:
        return {
            "status": "blocked",
            "reason": "no_ethical_agents",
            "Gamma_foam": -1,
            "P_total": 0.0,
            "foam": []
        }

    # === «Пена разума»: суперпозиция доменов ===
    D_fractal = 2.5  # фрактальная размерность пространства-времени
    omegas = [compute_omega_res(a["q"], a["m"], D=D_fractal) for a in ethical_agents]
    omegas = np.array(omegas)

    # α_i = softmax(ω_рез,i)
    alpha = np.exp(omegas - np.max(omegas))
    alpha = alpha / (alpha.sum() + 1e-8)

    # P_i — вероятность успеха подцели
    P_i = []
    for agent in ethical_agents:
        if agent["type"] == "material":
            P = min(1.0, agent["Tc"] / 293.0)
        else:
            P = (agent.get("access_score", 0) + agent.get("safety_score", 0)) / 2
        P_i.append(P)

    # P_total = 1 - ∏(1 - P_i)
    P_total = float(1.0 - np.prod([1.0 - p for p in P_i]))

    # Γ_foam = Σ Γ_i (упрощённо)
    Gamma_foam = sum(a["Gamma"] for a in ethical_agents)

    foam = []
    for i, agent in enumerate(ethical_agents):
        foam.append({
            "agent": agent,
            "amplitude": float(alpha[i]),
            "omega_res": float(omegas[i]),
            "P_i": float(P_i[i])
        })

    # === Этическая «коробка» ===
    E_min = 0.8
    ethical_box_open = (P_total >= E_min) and (Gamma_foam > 0)

    return {
        "status": "success" if ethical_box_open else "blocked",
        "reason": None if ethical_box_open else "ethical_box_closed",
        "foam": foam,
        "Gamma_foam": Gamma_foam,
        "P_total": P_total,
        "ethical_box_open": ethical_box_open,
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

        if not result["ethical_box_open"]:
            return {
                "status": "blocked",
                "message": "Решение не прошло этическую 'коробку' безопасности.",
                "Gamma_foam": round(result["Gamma_foam"], 2),
                "P_total": round(result["P_total"], 3),
                "D_fractal": result["D_fractal"]
            }

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
        elif agent["type"] == "social_policy":
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
            "Gamma_foam": round(result["Gamma_foam"], 2),
            "P_total": round(result["P_total"], 3),
            "top_amplitude": round(top["amplitude"], 3),
            "D_fractal": result["D_fractal"]
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка симуляции: {str(e)}")
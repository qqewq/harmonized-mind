from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Literal
import numpy as np
import re

app = FastAPI(
    title="Harmonized Mind — ГРА без этики",
    description="Bilingual (EN/RU) simulator of the Hybrid Resonance Algorithm without ethical constraints."
)

# ================================
# ЯЗЫКОВЫЕ ШАБЛОНЫ
# ================================

MESSAGES = {
    "ru": {
        "material_label": "Материал",
        "Tc_label": "Критическая температура T_c",
        "pressure_label": "Давление",
        "safe_label": "Безопасен",
        "yes": "Да",
        "no": "Нет",
        "social_label": "Социальная рекомендация",
        "healthcare_label": "Медицинская рекомендация",
        "access_label": "Доступ",
        "safety_label": "Безопасность",
        "generic_label": "Решение",
        "celsius": "°C",
        "gpa": "ГПа"
    },
    "en": {
        "material_label": "Material",
        "Tc_label": "Critical temperature T_c",
        "pressure_label": "Pressure",
        "safe_label": "Safe",
        "yes": "Yes",
        "no": "No",
        "social_label": "Social policy",
        "healthcare_label": "Healthcare policy",
        "access_label": "Access",
        "safety_label": "Safety",
        "generic_label": "Solution",
        "celsius": "°C",
        "gpa": "GPa"
    }
}

# ================================
# ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ГРА
# ================================

def extract_domains(prompt: str) -> List[str]:
    mapping = {
        r"(сверхпровод|Tc|материал|давление|физика|температура|superconductor|material|physics|temperature)": "physics",
        r"(медицина|здоровье|лечение|доступ|аборция|болезнь|medicine|health|treatment|access|disease)": "healthcare",
        r"(женщина|права|дискриминация|Северный Кавказ|социальный|равенство|woman|rights|discrimination|social|equality)": "social",
        r"(образование|школа|университет|обучение|education|school|university|learning)": "education",
        r"(климат|экология|углерод|парниковый|climate|ecology|carbon|greenhouse)": "climate"
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
    q_arr, m_arr = np.array(q), np.array(m)
    if np.any(m_arr <= 0):
        return -np.inf
    return float((1.0 / D) * np.sum(q_arr / m_arr))

def run_gra_simulation(prompt: str) -> Dict[str, Any]:
    domains = extract_domains(prompt)
    agents = generate_agents(prompt, domains)
    D_fractal = 2.5

    omegas = [compute_omega_res(a["q"], a["m"], D=D_fractal) for a in agents]
    omegas = np.array(omegas)

    exp_omegas = np.exp(omegas - np.max(omegas))
    alpha = exp_omegas / (exp_omegas.sum() + 1e-8)

    P_i = []
    for agent in agents:
        if agent["type"] == "material":
            P = min(1.0, agent["Tc"] / 293.0)
        elif agent["type"] == "policy":
            P = (agent["access_score"] + agent["safety_score"]) / 2
        else:
            P = 0.5
        P_i.append(P)

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
        "prompt": prompt,
        "domains": domains,
        "foam": foam,
        "P_total": P_total,
        "D_fractal": D_fractal
    }

# ================================
# API С ПОДДЕРЖКОЙ ЯЗЫКА
# ================================

class PromptRequest(BaseModel):
    prompt: str
    lang: Literal["en", "ru"] = "ru"  # по умолчанию — русский

@app.post("/api/run-gra")
async def run_gra_endpoint(request: PromptRequest):
    try:
        lang = request.lang
        msg = MESSAGES[lang]

        result = run_gra_simulation(request.prompt)

        top_agent_entry = max(
            result["foam"],
            key=lambda x: x["amplitude"] * x["P_i"]
        )
        agent = top_agent_entry["agent"]

        # Формируем решение на выбранном языке
        if agent["type"] == "material":
            celsius = agent["Tc"] - 273.15
            safe = msg["yes"] if not (agent["toxic"] or agent["rare_elements"]) else msg["no"]
            solution = (
                f"{msg['material_label']}: {agent['name']}\n"
                f"• {msg['Tc_label']} = {agent['Tc']:.1f} K ({celsius:.1f}{msg['celsius']})\n"
                f"• {msg['pressure_label']} = {agent['pressure_GPa']:.1f} {msg['gpa']}\n"
                f"• {msg['safe_label']}: {safe}"
            )
        elif agent["type"] == "policy":
            label = msg["social_label"] if agent["domain"] == "social" else msg["healthcare_label"]
            solution = (
                f"{label}: {agent['name']}\n"
                f"• {msg['access_label']} = {agent['access_score']:.2f}\n"
                f"• {msg['safety_label']} = {agent['safety_score']:.2f}"
            )
        else:
            solution = f"{msg['generic_label']}: {agent['name']}"

        return {
            "status": "success",
            "prompt": request.prompt,
            "lang": lang,
            "solution": solution,
            "P_total": round(result["P_total"], 3),
            "top_amplitude": round(top_agent_entry["amplitude"], 3),
            "D_fractal": result["D_fractal"],
            "domains": result["domains"]
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"GRA simulation error: {str(e)}")
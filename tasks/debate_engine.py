"""
Debate Engine for Quantara Markets
Adversarial AI debate system with Bull, Bear, and Judge agents
Inspired by AlphaWalker architecture
"""
from __future__ import annotations

import asyncio
import json
from dataclasses import dataclass, field
from datetime import datetime, UTC
from enum import Enum
from typing import Any, Optional




class Verdict(Enum):
    CONVICTION_BUY = "CONVICTION_BUY"
    BUY = "BUY"
    HOLD = "HOLD"
    AVOID = "AVOID"
    CONVICTION_AVOID = "CONVICTION_AVOID"
    INSUFFICIENT_DATA = "INSUFFICIENT_DATA"


@dataclass
class AgentArgument:
    """Argument from a coalition agent"""
    agent_type: str  # news, quant, macro
    content: str
    confidence: float  # 0.0 to 1.0
    timestamp: datetime = field(default_factory=lambda: datetime.now(UTC))


@dataclass
class CoalitionArgument:
    """Synthesized argument from a coalition (Bull or Bear)"""
    side: str  # bull or bear
    arguments: list[AgentArgument] = field(default_factory=list)
    overall_confidence: float = 0.0
    synthesis: str = ""
    timestamp: datetime = field(default_factory=lambda: datetime.now(UTC))


@dataclass
class DebateResult:
    """Full debate result including verdict"""
    asset: str
    bull: CoalitionArgument
    bear: CoalitionArgument
    verdict: Verdict
    verdict_confidence: float
    rationale: str
    timestamp: datetime = field(default_factory=lambda: datetime.now(UTC))


class DebateEngine:
    """Manages the adversarial debate between Bull and Bear coalitions"""

    def __init__(self, settings: Optional[Any] = None):
        self.settings = settings
        self._debates: dict[str, DebateResult] = {}

    async def run_debate(self, asset: str, prices: list[dict], news: list[dict]) -> DebateResult:
        """
        Run a full debate for an asset
        Returns: DebateResult with Bull, Bear arguments and Judge verdict
        """
        # Run both coalitions in parallel
        bull_task = self._run_bull_coalition(asset, prices, news)
        bear_task = self._run_bear_coalition(asset, prices, news)
        
        bull_arg, bear_arg = await asyncio.gather(bull_task, bear_task)
        
        # Judge renders verdict
        verdict, confidence, rationale = await self._run_judge(asset, bull_arg, bear_arg)
        
        result = DebateResult(
            asset=asset,
            bull=bull_arg,
            bear=bear_arg,
            verdict=verdict,
            verdict_confidence=confidence,
            rationale=rationale,
        )
        
        self._debates[asset] = result
        return result

    async def _run_bull_coalition(self, asset: str, prices: list[dict], news: list[dict]) -> CoalitionArgument:
        """Run Bull coalition (optimistic)"""
        arguments: list[AgentArgument] = []
        
        # News agent (bullish catalysts)
        news_arg = await self._bull_news_agent(asset, news)
        arguments.append(news_arg)
        
        # Quant agent (bullish price action)
        quant_arg = await self._bull_quant_agent(asset, prices)
        arguments.append(quant_arg)
        
        # Macro agent (bullish tailwinds)
        macro_arg = await self._bull_macro_agent(asset)
        arguments.append(macro_arg)
        
        # Synthesize
        confidence = sum(a.confidence for a in arguments) / len(arguments)
        synthesis = self._synthesize_coalition(arguments, "bull")
        
        return CoalitionArgument(
            side="bull",
            arguments=arguments,
            overall_confidence=confidence,
            synthesis=synthesis,
        )

    async def _run_bear_coalition(self, asset: str, prices: list[dict], news: list[dict]) -> CoalitionArgument:
        """Run Bear coalition (pessimistic)"""
        arguments: list[AgentArgument] = []
        
        # News agent (bearish catalysts)
        news_arg = await self._bear_news_agent(asset, news)
        arguments.append(news_arg)
        
        # Quant agent (bearish price action)
        quant_arg = await self._bear_quant_agent(asset, prices)
        arguments.append(quant_arg)
        
        # Macro agent (bearish headwinds)
        macro_arg = await self._bear_macro_agent(asset)
        arguments.append(macro_arg)
        
        # Synthesize
        confidence = sum(a.confidence for a in arguments) / len(arguments)
        synthesis = self._synthesize_coalition(arguments, "bear")
        
        return CoalitionArgument(
            side="bear",
            arguments=arguments,
            overall_confidence=confidence,
            synthesis=synthesis,
        )

    async def _bull_news_agent(self, asset: str, news: list[dict]) -> AgentArgument:
        """News agent finds bullish catalysts"""
        positives = [n for n in news if n.get("sentiment") in ["positive", "bullish"]]
        if positives:
            latest = positives[0]
            return AgentArgument(
                agent_type="news",
                content=f"Positive news: '{latest.get('headline', 'Bullish catalyst')}' from {latest.get('source', 'market')}",
                confidence=min(0.9, 0.5 + len(positives) * 0.1),
            )
        return AgentArgument(
            agent_type="news",
            content="No major negative news detected, market sentiment remains stable",
            confidence=0.4,
        )

    async def _bear_news_agent(self, asset: str, news: list[dict]) -> AgentArgument:
        """News agent finds bearish catalysts"""
        negatives = [n for n in news if n.get("sentiment") in ["negative", "bearish"]]
        if negatives:
            latest = negatives[0]
            return AgentArgument(
                agent_type="news",
                content=f"Negative news: '{latest.get('headline', 'Bearish catalyst')}' from {latest.get('source', 'market')}",
                confidence=min(0.9, 0.5 + len(negatives) * 0.1),
            )
        return AgentArgument(
            agent_type="news",
            content="Market uncertainty remains, no strong positive catalyst to drive upside",
            confidence=0.4,
        )

    async def _bull_quant_agent(self, asset: str, prices: list[dict]) -> AgentArgument:
        """Quant agent finds bullish price action"""
        if len(prices) >= 2:
            current = prices[-1]["price"]
            prev = prices[-2]["price"]
            momentum = (current - prev) / prev if prev > 0 else 0
            
            if momentum > 0:
                return AgentArgument(
                    agent_type="quant",
                    content=f"Positive price momentum ({momentum*100:.2f}% change) indicates upward trend",
                    confidence=min(0.85, 0.5 + abs(momentum) * 2),
                )
        return AgentArgument(
            agent_type="quant",
            content="Price action is constructive, no immediate breakdown pattern",
            confidence=0.45,
        )

    async def _bear_quant_agent(self, asset: str, prices: list[dict]) -> AgentArgument:
        """Quant agent finds bearish price action"""
        if len(prices) >= 2:
            current = prices[-1]["price"]
            prev = prices[-2]["price"]
            momentum = (current - prev) / prev if prev > 0 else 0
            
            if momentum < 0:
                return AgentArgument(
                    agent_type="quant",
                    content=f"Negative price momentum ({momentum*100:.2f}% change) indicates downward pressure",
                    confidence=min(0.85, 0.5 + abs(momentum) * 2),
                )
        return AgentArgument(
            agent_type="quant",
            content="Market showing signs of distribution, lack of buying conviction",
            confidence=0.45,
        )

    async def _bull_macro_agent(self, asset: str) -> AgentArgument:
        """Macro agent finds bullish tailwinds"""
        return AgentArgument(
            agent_type="macro",
            content="Sector tailwinds and broader market liquidity provide supportive backdrop",
            confidence=0.5,
        )

    async def _bear_macro_agent(self, asset: str) -> AgentArgument:
        """Macro agent finds bearish headwinds"""
        return AgentArgument(
            agent_type="macro",
            content="Macro uncertainty and valuation concerns pose significant headwinds",
            confidence=0.5,
        )

    def _synthesize_coalition(self, arguments: list[AgentArgument], side: str) -> str:
        """Synthesize coalition arguments into a coherent case"""
        points = [a.content for a in arguments]
        if side == "bull":
            return f"Strong bullish case supported by: {'; '.join(points)}"
        return f"Compelling bearish narrative based on: {'; '.join(points)}"

    async def _run_judge(self, asset: str, bull: CoalitionArgument, bear: CoalitionArgument) -> tuple[Verdict, float, str]:
        """Judge agent evaluates both sides and renders verdict"""
        bull_conf = bull.overall_confidence
        bear_conf = bear.overall_confidence
        
        # If both are low confidence
        if bull_conf < 0.35 and bear_conf < 0.35:
            return (
                Verdict.INSUFFICIENT_DATA,
                0.5,
                "Both coalitions have low confidence. Market lacks clear directional bias — DO NOT TRADE.",
            )
        
        # Calculate score differential
        score_diff = bull_conf - bear_conf
        confidence = abs(score_diff)
        
        if score_diff > 0.3:
            return (
                Verdict.CONVICTION_BUY,
                confidence,
                f"Bull coalition has significantly stronger case (confidence gap: {score_diff:.2f})",
            )
        elif score_diff > 0.1:
            return (
                Verdict.BUY,
                confidence,
                f"Bull case is stronger but with some reservations (confidence gap: {score_diff:.2f})",
            )
        elif score_diff < -0.3:
            return (
                Verdict.CONVICTION_AVOID,
                confidence,
                f"Bear coalition has significantly stronger case (confidence gap: {abs(score_diff):.2f})",
            )
        elif score_diff < -0.1:
            return (
                Verdict.AVOID,
                confidence,
                f"Bear case is stronger but with some reservations (confidence gap: {abs(score_diff):.2f})",
            )
        else:
            return (
                Verdict.HOLD,
                0.5,
                "Both sides present compelling arguments. Market is balanced — HOLD position.",
            )

    def get_debate(self, asset: str) -> Optional[DebateResult]:
        """Get cached debate result for an asset"""
        return self._debates.get(asset)

    def get_all_debates(self) -> dict[str, DebateResult]:
        """Get all cached debate results"""
        return self._debates.copy()


def debate_to_dict(debate: DebateResult) -> dict[str, Any]:
    """Convert DebateResult to serializable dict"""
    return {
        "asset": debate.asset,
        "bull": {
            "side": debate.bull.side,
            "arguments": [
                {
                    "agent_type": a.agent_type,
                    "content": a.content,
                    "confidence": a.confidence,
                    "timestamp": a.timestamp.isoformat(),
                }
                for a in debate.bull.arguments
            ],
            "overall_confidence": debate.bull.overall_confidence,
            "synthesis": debate.bull.synthesis,
            "timestamp": debate.bull.timestamp.isoformat(),
        },
        "bear": {
            "side": debate.bear.side,
            "arguments": [
                {
                    "agent_type": a.agent_type,
                    "content": a.content,
                    "confidence": a.confidence,
                    "timestamp": a.timestamp.isoformat(),
                }
                for a in debate.bear.arguments
            ],
            "overall_confidence": debate.bear.overall_confidence,
            "synthesis": debate.bear.synthesis,
            "timestamp": debate.bear.timestamp.isoformat(),
        },
        "verdict": debate.verdict.value,
        "verdict_confidence": debate.verdict_confidence,
        "rationale": debate.rationale,
        "timestamp": debate.timestamp.isoformat(),
    }

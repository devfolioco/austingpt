from voice_agent.prompts.prompts import (
    build_mood_prompt,
    excited_initial_prompt,
    critical_initial_prompt,
    excited_greetings,
    critical_greetings,
    insufficient_info_excited_end_messages,
    insufficient_info_critical_end_messages,
)
from voice_agent.persona_config import (
    TIMEOUT_SECONDS,
    TIMEOUT_WARNING_TIME,
    SPEAK_DELAY,
    MAX_CALL_DURATION,
    CALL_DURATION_WARNING_TIME,
    DEFAULT_VOICE_ID as ELEVENLABS_DEFAULT_VOICE_ID,
)

mood_initial_prompts = {
    "excited": excited_initial_prompt,
    "critical": critical_initial_prompt,
}

mood_initial_greetings = {"excited": excited_greetings, "critical": critical_greetings}

mood_insufficient_info_end_messages = {
    "excited": insufficient_info_excited_end_messages,
    "critical": insufficient_info_critical_end_messages,
}

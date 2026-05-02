<?php
namespace App\Services;

class ScoringService
{
    public function processResults($test, $userAnswers)
    {
        $level = $test->level;
        $rawScores = $this->calculateRawScores($userAnswers);

        if (in_array($level, ['N4', 'N5'])) {
            return $this->formatForN4N5($rawScores);
        }

        return $this->formatForN1N3($rawScores);
    }

    private function formatForN4N5($raw)
    {
        // N4/N5: Lang Knowledge + Reading = 120, Listening = 60
        $section1_2 = $raw['vocabulary'] + $raw['grammar_reading'];
        $section3 = $raw['listening'];

        return [
            'language_knowledge_reading' => min($section1_2, 120),
            'listening' => min($section3, 60),
            'total' => $section1_2 + $section3,
            'status' => ($section1_2 + $section3 >= 90) ? 'Passed' : 'Failed'
        ];
    }

    private function formatForN1N3($raw)
    {
        // N1-N3: Har biri 60 balldan
        return [
            'language_knowledge' => min($raw['vocabulary'], 60),
            'reading' => min($raw['grammar_reading'], 60),
            'listening' => min($raw['listening'], 60),
            'total' => array_sum($raw),
            'status' => (array_sum($raw) >= 95) ? 'Passed' : 'Failed' // N3 uchun misol
        ];
    }
}
---
layout: article
title: Hidden Markov Model
tags: HMM Markov Model
lang: ko
mathjax: true
date: 2020-11-04 21:00
modify_date: 2020-11-04 21:00
key: post-2020110402
---

해당 글은 스탠포드 대학의 Speech and Language Processing (by Daniel Jurafsky & James H. Martin) 글 중 일부를 직접 번역 및 정리한 내용이다.

## 1. Markov Chains

HMM (Hidden Markov Model)은 Markov chain을 기반으로 하여 만들어진다. **Markov chain**은 순차적인 랜덤 변수들의 확률에 대한 정보를 알려주는 모델이다. 여기서 랜덤 변수들은 *states*이며, 각각의 state는 어떤 집합에 속하는 값들이 된다. 이런 집합은 단어들의 집합, 날씨의 집합 등 기호로 나타내는 어떤 것이든 될 수 있다. Markov chain은 매우 강한 추측을 전제로 하고 있는데, 이는 주어진 state들의 순차배열에서 미래를 추측하고자 하면 현재의 상태(current state)만 고려하면 된다는 것이다. 현재 state이전의 states는 미래 상태에 영향을 주지 않는다. 즉, 내일의 날씨에 대해 예측하고자 하면 오늘의 날씨는 분석하지만, 어제의 날씨는 분석하지 않는다.

[Figure A.1]

**Markov Assumption**

states의 순차배열 $q_1, q_2, \dots, q_i$을 생각해보자. Markov model은 해당 순차배열의 확률에 **Markov assumption**을 적용한다: 미래를 예측할 때는 과거는 고려하지 않고 현재만 고려한다.

$$P(q_i=a\vert q_1\dots q_{i-1})=P(q_i=a\vert q_{i-1})$$

Markov chain은 다음과 같은 요소들로 표현될 수 있다:
* $Q = q_1q_2\dots q_N$
  * $N$ **states**의 모임
* $A = a_{11}a_{12}\dots a_{n1}\dots a_{nn}$
  * **Transition probability matrix** $A$, 각 $a_{ij}$는 state $i$에서 state $j$로 이동하는 확률을 의미한다. $\forall i, \sum_{j=1}^na_{ij}=1$
* $\pi = \pi_1, \pi_2, \dots, \pi_N$
  * **Initial probability distribution**, 각 $\pi_i$는 Markov chain이 state $i$에서 처음 시작할 확률을 의미한다. $\pi_j=0$인 state $j$가 있을 수 있다. $\sum_{i=1}^n\pi_i=1$

## 2. The Hidden Markov Model

Markov chain은 관측 가능한 이벤트들의 순차배열에 대한 확률을 계산할 때 유용하다. 하지만, 많은 경우에 관찰하려는 이벤트들은 **hidden**상태에 있다. 즉, 직접적으로 관측할 수 없는 이벤트들일 경우가 많다. 예를 들어, 일반적으로 텍스트에 대한 태그를 관측하기 보다는 텍스트에 포함되어 있는 단어들로 부터 태그를 유추해 낸다. 이런 상황에서 태그들을 **hidden**이라고 한다.

**Hidden Markov Model** (**HMM**)은 서로 인과관계가 있어 보이는 *observed*(관측된) 이벤트와 *hidden*(직접 관측할 수 없는) 이벤트를 같이 고려하게 해준다.

HMM은 다음과 같은 요소들로 표현될 수 있다:
* $Q = q_1q_2\dots q_N$
  * $N$ **states**의 모임
* $A = a_{11}a_{12}\dots a_{n1}\dots a_{nn}$
  * **Transition probability matrix** $A$, 각 $a_{ij}$는 state $i$에서 state $j$로 이동하는 확률을 의미한다. $\forall i, \sum_{j=1}^na_{ij}=1$
* $O = o_1o_2\dots o_T$
  * $T$ **observations**의 순차배열
* $B = b_i(o_t)$
  * **Observation likelihoods** (aka. **emission probabilities**), state $i$에서 observation(관측) $o_t$가 발생할 확률을 의미한다.
* $\pi = \pi_1, \pi_2, \dots, \pi_N$
  * **Initial probability distribution**, 각 $\pi_i$는 Markov chain이 state $i$에서 처음 시작할 확률을 의미한다. $\pi_j=0$인 state $j$가 있을 수 있다. $\sum_{i=1}^n\pi_i=1$

1차 HMM (first-order hidden Markov model)은 2가지 간소화한 가정을 가진다.
* 1차 Markov chain과 같이 특정 state에 대한 확률은 오직 직전 state에만 의존성을 가진다.
  * **Markov Assumption:** $P(q_i\vert q_1\dots q_{i-1})=P(q_i\vert q_{i-1})$
* Output observation(관측 결과) $o_i$에 대한 확률은 관측을 만들어낸 state $q_i$에만 의존성을 가진다.
  * **Output Independence:** $P(o_i\vert q_1,\dots,q_i,\dots,q_T,o_1,\dots,o_i,\dots,o_T)=P(o_i\vert q_i)$

해당 모델을 Jason Eisner (2002)가 개발한 작업을 이용해 예를 들어보자.

당신은 지구 온난화의 역사를 연구하는 2799년의 기후학자이다. 그런데 볼티모어, 메릴랜드에서의 2020년 여름에 기록된 날씨 자료를 찾을 수 없었다. 하지만 Jason Eisner의 일기장을 발견했다. 그 일기장에는 Jason이 그해 여름에 매일 얼마나 많은 아이스크림을 먹었는지 기록되어 있다. 우리의 목표는 해당 observations(관측값)으로 부터 각 날의 기온을 추정하는 것이다. 이 문제를 각 날은 오직 두 가지 중 하나의 날씨를 가진다고 하여 단순화 하자: cold (C), hot (H). 그렇다면 Eisner 작업은 다음과 같다:
* 주어진 observations(관측값) 순차배열 $O$ (각 원소는 각 날에 먹은 아이스크림의 개수를 나타내는 정수값을 가짐)에 대해 Jason이 아이스크림을 먹게 만든 날씨 상태를 나타내는 (H 또는 C) '숨겨진' 순차배열 $Q$를 찾는다.

Figure A.2가 아이스크림 작업에 대한 예시 HMM을 나타낸다. 두 hidden states (H와 C)는 hot, cold 날씨와 대응된다. 그리고 observations ($O=\{1, 2, 3\}$)는 Json이 주어진 날에 먹은 아이스크림의 개수에 대응된다.

[Figure A.2]

1960년대 Jack Ferguson의 튜토리얼에 기초한 Rabiner (1989)의 영향력 있는 튜토리얼은 hidden Markov models가 **3가지 근본적 문제** (**three fundamental problems**)로 특징 지어진다는 아이디어를 제시했다:
* Problem 1 (Likelihood)
  * 주어진 HMM $\lambda = (A, B)$과 observation sequence $O$에 대해 우도(likelihood) $P(O\vert \lambda)$를 구하라.
* Problem 2 (Decoding)
  * 주어진 observation sequence $O$와 HMM $\lambda = (A, B)$에 대해 최적의 hidden state sequence $Q$를 구하라.
* Problem 3 (Learning)
  * 주어진 observation sequence $O$와 HMM에 존재하는 states의 집합에 대해 HMM의 파라미터 $A$와 $B$의 값을 학습하라.

## 3. Likelihood Computation: The Forward Algorithm

첫번째 문제는 특정 observation sequence에 대한 우도 (likelihood)를 계산하는 것이다. 예를 들어, 앞서 예를 든 아이스크림 HMM에서 sequence 3 1 3 의 확률은 얼마나 되는지 계산하는 것이다.

이를 일반화 하면 다음과 같다:
* **Computing Likelihood:** 주어진 HMM $\lambda = (A, B)$와 observation sequence $O$에 대해 우도 $P(O\vert \lambda )$를 구하라.

Hidden events와 동일한 생태들을 가진 Markov chain이라면, 3 1 3에 대한 확률을 3 1 3으로 label된 states를 따라가며 해당 경로에 있는 간선들의 확률들을 곱해주면 된다. 반면 hidden Markov model에서는 그렇게 간단하지 않다. 우린 아이스크림 observation sequence가 3 1 3인 확률을 구하고 싶지만, hidden state sequence를 모르기 때문이다.

좀 더 간단한 상황으로 시작해보자. 날씨에 대한 정보는 이미 알고 있다고 가정하고 Jason이 먹을 아이스크림 개수를 예측하고 싶다. 이것은 많은 HMM 작업에서 유용한 과정이다. 주어진 hidden state sequence (e.g. *hot* *hot* *cold*)에서 3 1 3에 대한 우도를 쉽게 계산할 수 있다.

어떻게 계산하는지 살펴보면, 먼저 hidden Markov models에서 각 hidden state는 오직 하나의 observation만 생성한다는 것을 기억하자. 그러므로 hidden states의 sequence와 observation sequence는 같은 길이를 가진다.

이러한 일대일 대응 관계와 Markov assumption을 통해 주어진 hidden state sequence $Q = q_0,q_1,q_2,\dots,q_T$와 observation sequence $O = o_1,o_2,\dots,o_T$에서 다음과 같이 우도를 계산할 수 있다.

$$P(O\vert Q) = \prod_{i=1}^T{P(o_i\vert q_i)}$$

따라서 앞서 예를 든 아이스크림 observation 3 1 3의 forward probability는 다음과 같이 계산된다.

$$P(\text{3 1 3}\vert \text{hot hot cold}) = P(\text{3}\vert \text{hot})\times P(\text{1}\vert \text{hot})\times P(\text{3}\vert \text{cold})$$

[Figure A.3]

하지만 당연하게도, 실제로는 hidden state(날씨) sequence를 알지 못한다. 따라서 가능한 모든 경우의 날씨 sequences를 계산하지 아이스크림 사건(events) 3 1 3의 확률을 계산해야 한다. 먼저, 특정한 날씨 sequence $Q$를 가지고 특정한 sequence $O$의 아이스크림 사건(events)를 생성할 결합확률(joint probability)를 계산해 보자.

$$P(O, Q) = P(O\vert Q)\times P(Q) = \prod_{i=1}^T{P(o_i\vert q_i)}\times \prod_{i=1}^T{P(q_i\vert q_{i-1})}$$

아이스크림 observation 3 1 3과 하나의 가능성 있는 hidden state sequence인 *hot* *hot* *cold*에 대한 결합확률은 다음과 같다.

$$P(\text{3 1 3}, \text{hot hot cold}) = P(\text{hot}\vert \text{start})\times P(\text{hot}\vert \text{hot})\times P(\text{cold}\vert \text{hot})\times P(\text{3}\vert \text{hot})\times P(\text{1}\vert \text{hot})\times P(\text{3}\vert \text{cold})$$

[Figure A.4]

이제 특정 hidden state sequence에 대한 observations의 확률을 계산할 수 있으므로, observations에 대한 확률을 가능한 모든 hidden state sequence를 합하여 계산할 수 있다.

$$P(O) = \sum_{Q}{P(O, Q)} = \sum_Q{P(O\vert Q)P(Q)}$$

앞서 예를 든 3개 event sequence에 대한 확률은 다음과 같이 구할 수 있다.

$$P(\text{3 1 3}) = P(\text{3 1 3}, \text{cold cold cold}) + P(\text{3 1 3}, \text{cold cold hot}) + P(\text{3 1 3}, \text{hot hot cold}) + \dots$$

$N$개의 hidden states를 가지고 있는 HMM과 $T$개의 관측값을 가지고 있는 observation sequence에 대해 $N^T$의 가능한 hidden sequences가 있음을 알 수 있다. 실제 작업에는 $N$과 $T$ 모두 크므로 $N^T$는 매우 큰 숫자가된다. 따라서 observation 우도를 가능한 모든 hidden state sequence를 고려하여 계산할 수 없다.

이러한 exponential algorithm을 사용하는 대신에 **forward algorithm**을 사용하여 $O(N^2T)$만에 효율적으로 구할 수 있다. 이 forward algorithm은 table을 만들어 중간값을 저장하고 observation sequence에 대한 확률을 계산해 나가는 **dynamic programming** 알고리즘을 이용한다.

Figure A.5 에서 forward algorithm을 이용한 3 1 3에 대한 우도를 계산하는 예시를 보여준다.

[Figure A.5]

Forward algorithm에서의 $\alpha_t(j)$는 주어진 $\lambda$에서 $t$까지의 observations를 보고 state $j$에 위치할 확률을 나타낸다. 각 $\alpha_t(j)$의 값은 해당 state로 올 수 있는 모든 경로에 대한 확률을 바탕으로 계산된다. 일반적으로 다음과 같이 표현된다.

$$\alpha_t(j) = P(o_1, o_2, \dots, o_t, q_t=j\vert \lambda)$$

이때 $q_t = j$는 state sequence에서 $t$번째 state가 $j$인 경우를 뜻한다. 이러한 $\alpha_t(j)$를 $t-1$에서의 모든 경로에서 해당 state로 오게 되는 경로로 확장한 결과를 더하여 구할 수 있다. 주어진 $t$에서의 state $q_j$에 대해 $\alpha_t(j)$ 값은 다음과 같이 계산한다.

$$\alpha_t(j) = \sum_{i = 1}^N{\alpha_{t-1}(i)a_{ij}b_j(o_t)}$$

이를 풀어쓰면 다음과 같다.
* $\alpha_{t-1}(i)$
  * 이전 시간에서 직전 forward 경로에 대한 확률
* $a_{ij}$
  * 이전 state $q_i$에서 현재 state $q_j$로의 transition probability
* $b_j(o_t)$
  * 주어진 현재 state $j$에서 observation $o_t$의 state observation likelihood

알고리즘을 정리하면 다음과 같다.

1. Initialization:
    * $\alpha_1(j) = \pi_jb_j(o_1)$ $1\leq j \leq N$
2. Recursion:
    * $\alpha_t(j) = \sum_{i=1}^N{\alpha_{t-1}(i)a_{ij}b_j(o_t)}$ $1\leq j \leq N, 1 < t \leq T$
3. Termination:
    * $P(O\vert \lambda) = \sum_{i=1}^N{\alpha_T(i)}$

## 4. Decoding: The Viterbi Algorithm

HMM과 같이 hidden 변수를 가지고 있는 어떤 모델에 대해, observation sequence의 숨은 source sequence를 찾는 작업을 **decoding** 작업이라 한다. 아이스크림 예에서 3 1 3의 관측값과 HMM이 주어졌을 때, **decoder**의 작업은 최적의 hidden 날씨 sequence인 ($H$ $H$ $H$)를 찾는 것이다. 이를 일반화 하면

* **Decoding:** 주어진 HMM $\lambda = (A, B)$와 observations sequence $O = o_1, o_2, \dots, o_T$에 대해 가장 가능성 있는 state sequence $Q = q_1q_2q_3\dots q_T$를 찾아라.

이 문제에 대해 다음과 같은 방법을 생각할 수 있다: 가능한 모든 hidden state sequence ($HHH$, $HHC$, $HCH$, etc.)에 대해 forward algorithm을 돌리고 observation sequence의 우도를 계산한다. 그런 후에 우도가 가장 높은 hidden state sequence를 선택한다. 하지만 앞서 확인 했듯이 state sequence의 개수가 exponential하게 많기 때문에 불가능 하다는 것을 알 수 있다.

이 방법 대신, 가장 일반적인 HMMs에 대한 decoding algorithm은 **Viterbi algorithm**이다. Forward algorithm과 유사하게, **Viterbi**는 **dynamic programming**의 일종이다. 또한 Viterbi는 또 다른 dynamic programming을 이용하는 **minimum edit distance** 알고리즘과 굉장히 유사하다.

[Figure A.8]

Figure A.8은 Viterbi 알고리즘을 이용하여 observation sequence 3 1 3에 대한 최적의 hidden state sequence를 계산하는 예를 보여준다. 아이디어는 observation sequence를 왼쪽부터 오른쪽으로 처리하며 dp 테이블을 채워 나가는 것이다. 테이블의 각 값 $v_t(j)$은 주어진 $\lambda$에 대해 HMM이 처음 $t$개의 observations를 관측하고 가장 가능성 있는 state sequence $q_1, \dots, q_{t-1}$로 이동했을 때 state $j$를 가질 확률을 의미한다. 각 $v_t(j)$값은 현재 state로 이동할 수 있는 가장 가능성 있는 경로를 재귀적으로 가져와 계산한다. 이를 일반화 하면 다음과 같다.

$$v_t(j) = \max_{q_1, \dots, q_{t-1}}{P(q_1\dots q_{t-1}, o_1, o_2, \dots, o_t, q_t=j\vert \lambda)}$$

가능한 모든 이전 state sequence로 부터 최댓값 $\max_{q_1, \dots, q_{t-1}}$을 가져와서 가장 가능성 있는 경로를 표현한다는 점에 유의하라. 다른 dynamic programming 알고리즘과 마찬가지로, Viterbi는 DP table의 각 값을 재귀적으로 채워 나간다. 이미 시간 $t - 1$에 모든 각 state에 존재하게 되는 확률을 계산했다는 점을 이용하여, 현재 state로 이동할 수 있는 경로들 중 가장 높은 확률을 가진 경로를 확장하여 Viterbi 확률을 계산한다. 주어진 시간 $t$에서의 state $q_j$에 대해 $v_t(j)$의 값은 다음과 같이 계산된다.

$$v_t(j) = \max_{i=1}^N{v_{t-1}(i)a_{ij}b_{j}(o_t)}$$

시간 $t$에서 이전 경로를 연장하여 Viterbi 확률을 계산하기 위해 사용된 세가지 요소는 다음과 같다.

* $v_{t-1}(i)$
  * 이전 Viterbi 경로 확률
* $a_{ij}$
  * Transition probability
* $b_j(o_t)$
  * State observation 우도(likelihood)

알고리즘을 정리하면 다음과 같다.

1. Initialization:
    * $v_1(j) = \pi_jb_j(o_1)$  $1\leq j \leq N$
    * $bt_1(j) = 0$  $1 \leq j \leq N$
2. Recursion:
    * $v_t(j) = \max_{i=1}^N{v_{t-1}(i)a_{ij}b_j(o_t)}$  $1\leq j \leq N$, $1<t\leq T$
    * $bt_t(j) = \arg\max_{i=1}^N{v_{t-1}(i)a_{ij}b_j(o_t)}$  $1\leq j \leq N$, $1<t\leq T$
3. Termination:
    * The best score: $P* = \max_{i=1}^N{v_T(i)}$
    * The start of backtrace: $q_{T*} = \arg\max_{i=1}^N{v_T(i)}$

## 5. HMM Training: The Forward-Backward Algorithm

HMMs의 세번째 문제인 HMM의 파라메터인 행렬 $A$와 $B$를 학습하는 문제를 살펴보자.

* **Learning:** 주어진 observation sequence $O$와 가능한 states집합이 주어졌을 때, HMM의 파라메터 $A$와 $B$를 학습하는 것

이러한 학습 알고리즘에 주어지는 입력은 label되지 않은 observation sequence $O$와 가능성 있는 hidden states $Q$를 구성하는 어휘(vocabulary)이다. 따라서, 아이스크림 문제의 경우 observation sequence $O = \{1, 3, 2, \dots\}$와 hidden states의 집합 $H$와 $C$으로 학습을 진행한다.

HMM 학습을 위해 사용되는 표준 알고리즘은 **forward-backward** 알고리즘, 특수한 경우의 **Expectation-Maximization**인 **Baum-Welch** 알고리즘(1972), 또는 **EM** 알고리즘(1977)이 있다. 알고리즘을 통해 HMM의 transition probability $A$와 emission probability $B$를 학습한다. EM은 *iterative* 알고리즘으로, 초기 추정 확률을 계산하고 해당 추정치를 이용하여 더 나은 추정치를 계산하는 것을 반복한다.

모든 state를 관측할 수 있는(fully visible) Markov model을 학습하는 아주 간단한 경우로 부터 시작해 보자. 각 날에 대한 온도와 아이스크림 양의 정보를 모두 알고 있는 상태다. 즉, 다음과 같이 observations와 마법처럼 알고 있는 이에 대응되는 hidden state sequence의 집합을 들을 수 있다.

$$3,3,2 \\ \text{hot},\text{hot},\text{cold}$$

$$1,1,2 \\ \text{cold},\text{cold},\text{cold}$$

$$1,2,3 \\ \text{cold},\text{hot},\text{hot}$$

이런 상황에서는 해당 학습 데이터를 이용한 최대 우도 추정으로 HMM 파라메터를 쉽게 계산할 수 있다. 먼저, 주어진 데이터의 3개의 초기 hidden state로 부터 다음과 같이 $\pi$를 계산할 수 있다.

$$\pi_h=1/3, \pi_c=2/3$$

주어진 데이터에서 마지막 hidden states는 무시하고 나머지 전환에서 부터 다음과 같이 행렬 $A$를 계산할 수 있다.

$$\begin{align}p(hot\vert hot) = 2/3 & p(cold\vert hot) = 1/3 \\ p(cold\vert cold) = 2/3 & p(hot\vert cold) = 1/3\end{align}$$

행렬 $B$도 다음과 같이 구할 수 있다.

$$\begin{align}p(1\vert hot) = 0/4 = 0 & p(1\vert cold) = 3/5 = .6 \\ p(2\vert hot) = 1/4 = .25 & p(2\vert cold) = 2/5 = .4 \\ p(3\vert hot) = 3/4 = .75 & p(3\vert cold) = 0 \end{align}$$


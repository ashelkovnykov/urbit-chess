import React, { useState } from 'react'
import Popup from 'reactjs-popup'
import { pokeAction, challenge, acceptGame, declineGame } from '../ts/helpers/urbitChess'
import useChessStore from '../ts/state/chessStore'
import { Challenge, Side, Ship } from '../ts/types/urbitChess'

const selectedSideButtonClasses = 'side radio-selected'
const unselectedSideButtonClasses = 'side radio-unselected'

export function Challenges () {
  const [who, setWho] = useState('')
  const [description, setDescription] = useState('')
  const [side, setSide] = useState(Side.Random)
  const [modalOpen, setModalOpen] = useState(false)
  const [badChallengeAttempts, setBadChallengeAttempts] = useState(0)
  const { urbit, incomingChallenges, removeChallenge } = useChessStore()

  const openModal = () => {
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
  }

  const incrementBadChallengeAttempts = () => {
    setBadChallengeAttempts(badChallengeAttempts + 1)
  }

  const resetChallengeInterface = () => {
    setWho('')
    setDescription('')
    setSide(Side.Random)
    setBadChallengeAttempts(0)

    closeModal()
  }

  const challengerKing = (side: Side): string => {
    switch (side) {
      case Side.White: {
        return '♔'
      }
      case Side.Black: {
        return '♚'
      }
      case Side.Random:
        return '⚂'
    }
  }

  const acceptChallenge = async (who: Ship) => {
    const onSuccess = () => {
      removeChallenge(who)
    }

    await pokeAction(urbit, acceptGame(who), () => {}, onSuccess)
  }

  const declineChallenge = async (who: Ship) => {
    const onSuccess = () => {
      removeChallenge(who)
    }

    await pokeAction(urbit, declineGame(who), () => {}, onSuccess)
  }

  const sendChallenge = async () => {
    const onError = () => {
      incrementBadChallengeAttempts()
    }

    const onSuccess = () => {
      resetChallengeInterface()
    }

    await pokeAction(urbit, challenge(who, side, description), onError, onSuccess)
  }

  return (
    <div className='challenges-container col'>
      <button className='option' onClick={openModal}>new challenge</button>
      <ul className='game-list'>
        {
          Array.from(incomingChallenges).map(([challenger, challenge], key) => {
            const colorClass = (key % 2) ? 'odd' : 'even'
            const description = challenge.event
            const mySide = (challenge.challengerSide === Side.White) ? 'b' : 'w'

            return (
              <li className={`game challenge ${colorClass}`} key={key}>
                <div className='challenge-box'>
                  <div className='row'>
                    <img
                      src={`https://raw.githubusercontent.com/lichess-org/lila/5a9672eacb870d4d012ae09d95aa4a7fdd5c8dbf/public/piece/cburnett/${mySide}N.svg`}
                    />
                    <div className='col'>
                      <p className='challenger-name'>{challenger}</p>
                      <p
                        title={description}
                        className='challenger-desc'
                      >
                        {description}
                      </p>
                    </div>
                  </div>
                  <div className='col'>
                    <button className="accept" onClick={() => acceptChallenge(challenger)}>accept</button>
                    <button className="reject" onClick={() => declineChallenge(challenger)}>decline</button>
                  </div>
                </div>
              </li>
            )
          })
        }
      </ul>
      {/* XX: should we host the LiChess images locally? */}
      <Popup open={modalOpen} onClose={resetChallengeInterface}>
        <div className='new-challenge-container col'>
          <p className='new-challenge-header'>new challenge</p>
          <div className='challenge-input-container row'>
            <p>opponent:</p>
            <input
              className={(badChallengeAttempts > 0) ? 'rejected' : ''}
              type="text"
              placeholder={'~sampel-palnet'}
              onChange={(e) => setWho(e.target.value)}
              key={badChallengeAttempts}/>
          </div>
          <div className='challenge-input-container row'>
            <p>description:</p>
            <input
              type="text"
              placeholder={'(optional)'}
              onChange={(e) => setDescription(e.target.value)}/>
          </div>
          <div className='challenge-side-container row'>
            <button
              className={(side === Side.White) ? selectedSideButtonClasses : unselectedSideButtonClasses}
              title='WHITE'
              style={{
                backgroundImage: 'url(https://raw.githubusercontent.com/lichess-org/lila/5a9672eacb870d4d012ae09d95aa4a7fdd5c8dbf/public/piece/cburnett/wK.svg)'
              }}
              onClick={() => setSide(Side.White)}/>
            <button
              className={(side === Side.Random) ? selectedSideButtonClasses : unselectedSideButtonClasses}
              title='RANDOM'
              style={{
                backgroundImage: 'url(https://raw.githubusercontent.com/lichess-org/lila/5a9672eacb870d4d012ae09d95aa4a7fdd5c8dbf/public/images/wbK.svg)'
              }}
              onClick={() => setSide(Side.Random)}/>
            <button
              className={(side === Side.Black) ? selectedSideButtonClasses : unselectedSideButtonClasses}
              title='BLACK'
              style={{
                backgroundImage: 'url(https://raw.githubusercontent.com/lichess-org/lila/5a9672eacb870d4d012ae09d95aa4a7fdd5c8dbf/public/piece/cburnett/bK.svg)'
              }}
              onClick={() => setSide(Side.Black)}/>
          </div>
          <button onClick={sendChallenge}>send challenge</button>
        </div>
      </Popup>
    </div>
  )
}

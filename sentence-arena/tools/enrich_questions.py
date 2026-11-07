"""Curated migration plus reproducible matched practice groups. Run from any directory."""
import json, re
from pathlib import Path
PATH = Path(__file__).resolve().parents[1] / 'questions.json'
bank = json.loads(PATH.read_text())
questions = [q for q in bank['questions'] if not q['id'].startswith('practice-')]
by_id = {q['id']: q for q in questions}
def fix(id, **values):
    if id in by_id: by_id[id].update(values)
fix('q007', explanation="The letters b-o-o-k spell 'book', pronounced /bʊk/. The letters 'oo' represent /ʊ/ in this word.")
fix('q309', prompt='A custom passed down through generations, such as celebrating a particular festival, is a ___.', explanation='A tradition is a particular custom handed down through generations. Culture is the wider way of life of a group.')
fix('q367', prompt='Choose the conjunction showing contrast: I wanted to go outside, ___ it started raining.', explanation="'But' explicitly shows contrast. 'And' can join events, but it does not express the contrast requested here.")
fix('q369', prompt='Choose the preposition meaning attached to a vertical surface: The poster is ___ the wall.', answer='on', options=['on','under','inside'], explanation="Use 'on' for something attached to a surface: the poster is on the wall.", topic='School', tags=['prepositions'])
fix('q383', prompt='The teacher said to our group, “You have done well.” Report what the teacher told us. Use “we” and backshift the tense.', explanation="The prompt specifies that we report words addressed to our group, so 'you' becomes 'we'. With the requested backshift, 'have done' becomes 'had done'.")
fix('q442', prompt='Change in inherited characteristics of populations over generations is called ___.', explanation='Evolution is change in inherited characteristics of populations over generations. An individual does not evolve during its lifetime.')
fix('q016', prompt='Expand “Riya has a bag.” Replace “a bag” with “a big blue bag”.')
fix('q355', prompt='Expand “The leaves turn yellow.” Put “All” before “the leaves” and add “slowly” at the end.')
fix('q412', prompt='Arrange these words into a passive sentence. Begin with “Careful observation”: Careful, observation, is, required, in, science.')
fix('q324', prompt='Unscramble the letters: eager to learn or know more.')
fix('q259', prompt='The middle value in a sorted dataset with an odd number of values is the ___.', explanation='For an odd number of sorted values, the median is the middle value. For an even number, it is the mean of the two middle values.')
fix('q277', explanation='Microorganisms are microscopic living things, such as bacteria and microscopic fungi. A microscope helps us see them.')
fix('q356', prompt='Expand “Water boils.” Add “at standard atmospheric pressure” and “at 100 degrees Celsius”.', answer='Water boils at 100 degrees Celsius at standard atmospheric pressure.', explanation='At standard atmospheric pressure, water boils at 100 degrees Celsius. The added phrases state the temperature and the pressure condition.')
fix('q362', prompt='Make this scientifically incorrect statement negative: Friction allows objects to slide easily.')
fix('q433', prompt='An organisation operating in more than one country is a ___ company.', explanation="'Multinational' describes a company operating in multiple countries. It modifies the noun 'company'.")
fix('q404', acceptedAnswers=['The ancient river slowly flows through the valley.'])
fix('q382', acceptedAnswers=['Wheat is grown in the field by the farmer.'])
fix('q356', acceptedAnswers=['Water boils at standard atmospheric pressure at 100 degrees Celsius.'])
fix('q357', acceptedAnswers=['The scientist carefully observed the reaction.'])
fix('q412', acceptedAnswers=['Careful observation in science is required.'])
for id in ['q034','q384']:
    if id in by_id: by_id[id]['prompt'] = by_id[id]['prompt'].replace(' Use backshift and include “that”.','') + ' Use backshift and include “that”.'
# Each set supplies four parallel contexts, with different verbs and objects, rather than name swaps.
levels = [
 dict(id='foundational', grades=[1,2,3], scenarios=[('Riya','she','reads','read','a book','School'),('Kabir','he','paints','paint','a kite','Everyday life'),('Meera','she','waters','water','a plant','Nature'),('Arun','he','cleans','clean','a desk','School')]),
 dict(id='developing', grades=[4,5,6,7], scenarios=[('The gardener','she','waters','water','the young plants','Nature'),('The librarian','he','sorts','sort','the new books','School'),('The artist','she','paints','paint','the wooden chairs','Everyday life'),('The volunteer','he','cleans','clean','the public benches','Community')]),
 dict(id='advanced', grades=[8,9,10], scenarios=[('The researcher','she','checks','check','the collected samples','Science'),('The editor','he','reviews','review','the submitted articles','Communication'),('The engineer','she','tests','test','the repaired machines','Technology'),('The organiser','he','records','record','the suggested improvements','Community')])
]
# Focus each mode on one measurable language action. Word scrambles remain a vocabulary warm-up.
skills={1:'spelling',2:'statement-word-order',3:'statement-word-order',4:'subject-verb-agreement',5:'subject-verb-object',6:'question-answer-matching',7:'yes-no-questions',8:'negative-formation',9:'past-tense',10:'cause-and-reason',11:'statement-word-order',12:'subject-verb-agreement',13:'sentence-expansion',14:'future-transformation',15:'sentence-chaining',16:'phrase-order',17:'wh-questions',18:'reason-conjunction',19:'independent-composition',20:'required-word-composition',21:'sequence-order',22:'subject-verb-agreement',23:'statement-word-order',24:'subject-verb-agreement',25:'sentence-combination',26:'statement-word-order',27:'first-conditional',28:'preposition-place',29:'adjective-selection',30:'adverb-selection',31:'subject-pronouns',32:'sentence-types',33:'passive-voice',34:'reported-speech',35:'sentence-patterns',36:'sentence-expansion',37:'phrase-order',38:'sentence-recall',39:'meaning-and-logic',40:'constrained-construction'}
new=[]
for level in levels:
    for mode in range(1,41):
        group=f"{level['id']}-mode-{mode:02}"
        for i,(subject,pronoun,verb,base,obj,topic) in enumerate(level['scenarios']):
            lower=subject[0].lower()+subject[1:] if subject.startswith('The ') else subject
            sentence=f'{subject} {verb} {obj}.'
            q=dict(id=f'practice-{group}-{i+1}',mode=str(mode),grades=level['grades'],topic=topic,tags=[skills[mode]],kind='tiles',prompt=f'Build a statement beginning with “{subject}”.',answer=sentence,explanation=f'Begin with the subject “{subject}”, then the verb “{verb}”, then the object “{obj}”.',skill=skills[mode],languageDifficulty=level['id'],subjectKnowledge='everyday',challengeGroup=group,expectedSeconds={'foundational':35,'developing':45,'advanced':60}[level['id']])
            if mode==1:
                word=['book','kite','plant','desk'][i] if level['id']=='foundational' else ['garden','library','artist','helper'][i] if level['id']=='developing' else ['research','article','machine','organise'][i]
                q.update(prompt='Unscramble the letters: '+['something we read','a toy that flies on a string','a living thing with roots','a table used for school work'][i] if level['id']=='foundational' else 'Unscramble this '+['place for growing flowers','place to borrow books','person who makes art','person who gives assistance'][i] if level['id']=='developing' else 'Unscramble: '+['careful study to find information','a piece of writing','a device with working parts','to arrange and plan'][i],answer=word,letters=list(word),explanation=f'The letters spell “{word}”. Read the clue and check every letter.')
            elif mode in [4,24]:
                q.update(kind='choice',prompt=f'{subject} ___ {obj} every day.',answer=verb,options=[verb,base,base+'ing'],explanation=f'The subject “{subject}” is singular. In a present-tense statement use “{verb}”.',optionFeedback={base:f'“{base}” needs a plural subject or I/you here. This singular subject needs “{verb}”.',base+'ing':f'An -ing form needs a helping verb. This habit sentence needs “{verb}”.'})
            elif mode==6:
                q.update(kind='choice',prompt=f'Match the question: What does {lower} do?',answer=sentence,options=[sentence,f'{subject} is in the garden.',f'{subject} is very happy.'],explanation='The question asks for an action, so choose the sentence telling what the person does.',optionFeedback={f'{subject} is in the garden.':'This tells a place, not the action asked for.',f'{subject} is very happy.':'This describes a feeling, not the action asked for.'})
            elif mode==7:q.update(prompt=f'Make a yes/no question: {sentence}',answer=f'Does {lower} {base} {obj}?',explanation='Use Does + subject + base verb + object. After does, remove the verb ending -s.')
            elif mode==8:q.update(prompt=f'Make negative. Use “does not”: {sentence}',answer=f'{subject} does not {base} {obj}.',explanation='Use does not + base verb. Does carries the present-tense agreement.')
            elif mode==9:
                past={'read':'read','paint':'painted','water':'watered','clean':'cleaned','sort':'sorted','check':'checked','review':'reviewed','test':'tested','record':'recorded'}[base]
                q.update(prompt=f'Use the simple past: {subject} {verb} {obj}.',answer=f'{subject} {past} {obj}.',explanation=f'The simple past of “{base}” is “{past}”. The object stays the same.')
            elif mode==10:
                reason=['it is interesting','it is colourful','it needs water','it is dusty'][i] if level['id']=='foundational' else ['they need water','they need sorting','they need colour','they need cleaning'][i] if level['id']=='developing' else ['they need verification','they need proofreading','they need inspection','they need documentation'][i]
                q.update(prompt=f'Join the statement and reason with “because”: {sentence} Reason: {reason}.',answer=f'{subject} {verb} {obj} because {reason}.',explanation='Because introduces the reason after the main statement.')
            elif mode==12:q.update(prompt=f'Correct the agreement error: {subject} {base} {obj}.',explanation=f'The singular subject needs “{verb}” in a present-tense statement.')
            elif mode==13:q.update(prompt=f'Expand this statement by adding “carefully” at the end: {sentence}',answer=f'{subject} {verb} {obj} carefully.',acceptedAnswers=[f'{subject} carefully {verb} {obj}.'] if False else [],explanation='Carefully is an adverb telling how the action happens. The prompt asks for it at the end.')
            elif mode==14:q.update(prompt=f'Change to future with “will”: {sentence}',answer=f'{subject} will {base} {obj}.',explanation='Use will + base verb. Do not keep the present-tense -s after will.')
            elif mode==15:
                word=['Friends','Children','Neighbours','Families'][i]
                q.update(kind='creative',prompt=f'Continue the chain with a sentence beginning with “{word}”. Previous sentence: We help our {word.lower()}.',answer=f'{word} share their ideas.',required=[word.lower()],startsWith=word.lower(),explanation=f'Begin with “{word}” and write a complete sentence linked to the previous one.')
            elif mode==16:q.update(prompt='Put the three sentence pieces in subject → action → object order.',chunks=[subject,verb,obj+'.'])
            elif mode==17:q.update(prompt=f'Ask about the object: {sentence}',answer=f'What does {lower} {base}?',explanation='Ask What does + subject + base verb to find the object of a present-tense action.')
            elif mode==18:
                stem=[('I wore a coat','it was cold'),('We drank water','we were thirsty'),('She rested indoors','she felt tired'),('He opened a window','the room was hot')][i]
                q.update(prompt=f'Join with a conjunction that gives the reason: {stem[0]}. {stem[1].capitalize()}.',answer=f'{stem[0]} because {stem[1]}.',explanation='Because connects the action to its reason.')
            elif mode in [19,20]:
                required=[base,obj.split()[-1]] if mode==19 else [pronoun,base,obj.split()[-1]]
                q.update(kind='creative',prompt=f'Write a complete sentence using: {", ".join(required)}.',answer=f'{pronoun.capitalize()} can {base} {obj}.',required=required,explanation='Use every required word in a complete, meaningful sentence. The teacher checks grammar and meaning.')
            elif mode==21:
                chunks=[f'First {lower} collects the materials.',f'Next {pronoun} starts the task.',f'Finally {pronoun} checks the work.']
                q.update(prompt=f'Order {lower}’s routine using First → Next → Finally.',answer=' '.join(chunks),chunks=chunks,explanation='First introduces the beginning, Next continues the sequence, and Finally introduces the last step.')
            elif mode==22:
                wrong=f'{subject} {base} {obj}.';fragment=f'{subject} {base}ing {obj}.'
                q.update(kind='choice',prompt='Choose the complete present-tense sentence with correct agreement.',options=[sentence,wrong,fragment],explanation=f'A singular subject takes “{verb}”. A statement also needs a complete verb phrase.',optionFeedback={wrong:f'This singular subject needs “{verb}”, not “{base}”.',fragment:'This -ing form has no helping verb, so the verb phrase is incomplete.'})
            elif mode==25:q.update(prompt=f'Combine with “and” without repeating the subject: {subject} {verb} {obj}. {subject} smiles.',answer=f'{subject} {verb} {obj} and smiles.',explanation='Keep the subject once and use and to join the two actions.')
            elif mode==27:q.update(prompt=f'Build a first conditional: If {lower} has time / {pronoun} will {base} {obj}. Begin with “If”.',answer=f'If {lower} has time {pronoun} will {base} {obj}.',explanation='Use If + present simple, then will + base verb. In writing, put a comma after the if-clause.')
            elif mode==28:
                chunks=[('The cup','on','the table'),('The shoes','under','the bed'),('The child','between','two friends'),('The toy','inside','the box')][i]
                clue=['resting on its top surface','below it','with one friend on each side','enclosed within it'][i]
                q.update(prompt=f'Build a sentence: {chunks[0]} '+('are' if i==1 else 'is')+f' {clue}. Use “{chunks[1]}”.',answer=f'{chunks[0]} '+('are' if i==1 else 'is')+f' {chunks[1]} {chunks[2]}.',explanation=f'“{chunks[1]}” states the requested position. Keep the subject before its verb.')
            elif mode==29:
                adj=['colourful','young','wooden','public'][i]
                nouns=['kite','plant','chair','bench'];q.update(prompt=f'Expand “I see a {nouns[i]}.” Put “{adj}” before the noun.',answer=f'I see a {adj} {nouns[i]}.',explanation=f'The adjective “{adj}” goes before the noun “{nouns[i]}”.')
            elif mode==30:
                adverb=['carefully','quietly','slowly','neatly'][i]
                q.update(prompt=f'Add the adverb “{adverb}” at the end: {sentence}',answer=f'{subject} {verb} {obj} {adverb}.',explanation=f'“{adverb}” tells how the action happens. This task asks for it at the end.')
            elif mode==31:q.update(prompt=f'Replace “{subject}” with “{pronoun.capitalize()}”: {sentence}',answer=f'{pronoun.capitalize()} {verb} {obj}.',explanation='Replace the whole subject with the specified subject pronoun. Keep the verb and object unchanged.')
            elif mode==32:
                sample,answer=[('Please close the door.','Command'),('Where is your book?','Question'),('Our class reads stories.','Statement'),('What a beautiful picture!','Exclamation')][i]
                opts=['Command','Question','Statement','Exclamation'];exps={'Command':'A command asks or tells someone to do something.','Question':'A question asks for information.','Statement':'A statement gives information.','Exclamation':'An exclamation expresses strong feeling.'}
                q.update(kind='choice',prompt='Identify the sentence type: '+sample,answer=answer,options=opts,explanation=exps[answer],optionFeedback={v:exps[v]+' This sentence is a '+answer.lower()+'.' for v in opts if v!=answer})
            elif mode==33:
                participle={'read':'read','paint':'painted','water':'watered','clean':'cleaned','sort':'sorted','check':'checked','review':'reviewed','test':'tested','record':'recorded'}[base]
                q.update(prompt=f'Change to passive voice. Keep the agent: {sentence}',answer=f'{obj.capitalize()} '+('are' if obj.split()[-1].endswith('s') else 'is')+f' {participle} by {lower}.',explanation='Move the object to subject position. Use is/are + past participle, and keep by + agent.')
            elif mode==34:
                q.update(prompt=f'{subject} said, “I am ready.” Report this using “{pronoun}”, “that”, and the backshifted form “was”.',answer=f'{subject} said that {pronoun} was ready.',explanation=f'The prompt specifies the pronoun “{pronoun}”. Use that + subject + was for the requested backshift.')
            elif mode==35:
                samples=[('Birds fly.','Subject + verb'),('Riya reads books.','Subject + verb + object'),('The leaves are green.','Subject + verb + complement'),('Please read books.','Verb + object')];sample,answer=samples[i];opts=[v[1] for v in samples]
                q.update(kind='choice',prompt='Identify the sentence pattern: '+sample,answer=answer,options=opts,explanation={'Subject + verb':'Birds names the subject and fly is an intransitive verb.','Subject + verb + object':'Riya is the subject, reads the verb, and books the object.','Subject + verb + complement':'Green describes the subject after the linking verb are.','Verb + object':'This command has an understood subject you; the written words are a verb and its object.'}[answer],optionFeedback={v:f'This sentence follows {answer.lower()}. Identify what the verb is followed by before choosing {v.lower()}.' for v in opts if v!=answer})
            elif mode==36:q.update(prompt=f'Climb the ladder: {subject} {verb}. → {sentence} → Add “carefully” at the end.',answer=f'{subject} {verb} {obj} carefully.',explanation='First add the object to the action. Then add an adverb to explain how the action happens.')
            elif mode==37:q.update(prompt=f'Continue the supplied subject “{subject}” with the action and object.',prefix=subject,chunks=[verb,obj+'.'])
            elif mode==38:q.update(prompt='Remember the statement, then rebuild it.',memory=True)
            elif mode==39:
                stems=[('The room is dark.','We switch on a light.','We switch off every light.','We close every curtain.'),('The floor is wet.','We walk carefully.','We run quickly.','We jump on the puddle.'),('The plants are dry.','We water the plants.','We remove all the soil.','We hide the watering can.'),('A friend needs help reading.','We read together.','We hide the book.','We refuse to listen.')][i]
                q.update(kind='choice',prompt=stems[0]+' Choose the helpful response.',answer=stems[1],options=list(stems[1:]),explanation='The selected response directly helps solve the stated problem.',optionFeedback={v:f'“{v}” does not help with this situation: {stems[0]}' for v in stems[2:]})
            elif mode==40:q.update(prompt=f'Use every tile to build a future statement. Begin with “{subject}” and include “will”.',answer=f'{subject} will {base} {obj}.',explanation='A future statement uses subject + will + base verb + object.')
            if level['id']=='advanced' and mode in [2,3,5,11,16,23,26]:
                q['answer']=f'{subject} {verb} {obj} before the meeting begins.'
                q['prompt']=f'Build a statement beginning with “{subject}”. Put the time clause beginning “before” at the end.'
                q.pop('chunks',None);q['explanation']='Keep subject + verb + object in the main clause; before introduces the time clause.'
            # Language demand is separate from school grade and subject vocabulary.
            if level['id']=='advanced' and mode not in [2,3,5,11,16,23,26,33,34]:
                q['languageDifficulty']='developing'
            # Keep younger learners on simple forms; explicitly label harder structures as extension practice.
            extension=mode in [27,33,34] and level['id']=='foundational'
            if extension:q['grades']=[3];q['languageDifficulty']='developing';q['expectedSeconds']=60;q['challengeGroup']=group+'-extension'
            q['hints']=(['Say a word that matches the clue.',f'The word starts with “{q["answer"][0]}” and has {len(q["answer"])} letters.',q['explanation']] if mode==1 else ['Identify the task: '+skills[mode].replace('-',' ')+'.',('Find the subject first, then look for the complete verb phrase.' if q['kind']=='tiles' else 'Check meaning as well as grammar before choosing or writing.'),q['explanation']])
            q['followUpIds']=[f'practice-{level["id"]}-mode-{target:02}-{i+1}' for target in [3,7,8] if target!=mode]
            q['source']={'type':'authored-practice','reviewStatus':'needs-teacher-pilot','note':'Matched language practice; grade ranges are guidance, not certified curriculum alignment.'}
            new.append(q)
# Add explicit alternatives only where the prompt does not constrain the position.
# Legacy tasks are kept for practice; sparse groups are visibly unavailable for racing.
for q in questions:
    q.setdefault('acceptedAnswers',[])
    q['skill']=('vocabulary-in-context' if q['mode']=='4' and q['answer'] not in ['has','have','is','are'] else 'articles' if q['mode']=='24' else 'conjunction-selection' if q['mode']=='18' else skills[int(q['mode'])])
    q.setdefault('languageDifficulty','advanced' if q['mode'] in ['33','34'] else 'developing' if q['mode'] in ['13','14','17','21','27','36','38'] else 'foundational')
    q.setdefault('subjectKnowledge','curriculum-vocabulary' if q['topic'] in ['Science','Mathematics','Social Studies'] else 'everyday')
    # Broad compatibility labels do not fabricate balanced authored groups for unlike tasks.
    q.setdefault('expectedSeconds',45 if q['kind']=='choice' else 60)
    if q.get('letters'):q['expectedSeconds']=30 if len(q['letters'])<=5 else 45 if len(q['letters'])<=8 else 60
    q.setdefault('challengeGroup',f"legacy-{q['mode']}-{q['languageDifficulty']}-{q['subjectKnowledge']}-{q['expectedSeconds']}")
    q.setdefault('hints',['Read what the instruction asks you to do.',q['explanation']])
    q.setdefault('source',{'type':'existing-bank','reviewStatus':'needs-curriculum-review'})
    if q['kind']=='choice':
        explanations={'have':'Use have with I, you, we or they; this singular subject needs has.','having':'Having needs a helping verb in a complete statement.','and':'And adds information; the requested contrast needs but.','but':'But shows contrast; a reason needs because.','or':'Or offers alternatives; it does not give the requested reason.'}
        feedback={}
        for option in q['options']:
            if option==q['answer']:feedback[option]=q['explanation'];continue
            definition=next((other['explanation'] for other in questions if other['answer'].lower()==option.lower() and other['id']!=q['id']),None)
            feedback[option]=(f'“{option}”: '+definition+' ') if definition else ''
            feedback[option]+=f'This clue needs “{q["answer"]}”. '+q['explanation']
            if option in explanations and q['mode'] in ['4','18','24']:feedback[option]=explanations[option]+' '+q['explanation']
        q['optionFeedback']=feedback
for q in new:
    q.setdefault('acceptedAnswers',[])
    if q['kind']=='choice':q['optionFeedback'][q['answer']]=q['explanation']
bank.update(version=2,questions=questions+new,learningMetadata={'languageDifficulty':['foundational','developing','advanced'],'subjectKnowledge':['everyday','curriculum-vocabulary'],'groupPolicy':'Match mode, skill, English difficulty, subject knowledge and expected time. Require four distinct answer sets per group.'})
PATH.write_text(json.dumps(bank,indent=2,ensure_ascii=False)+'\n')
print(f'{len(questions)} corrected/enriched existing + {len(new)} authored matched exercises = {len(bank["questions"])} questions')
